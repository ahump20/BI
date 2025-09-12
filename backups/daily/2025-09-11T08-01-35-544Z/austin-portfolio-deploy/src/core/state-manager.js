/**
 * Blaze Intelligence State Management System
 * Centralized state management with reactive updates and persistence
 */

class BlazeStateManager {
  constructor() {
    this.state = {
      // System state
      system: {
        initialized: false,
        loading: false,
        error: null,
        environment: 'development',
        version: '2.1.0',
        timestamp: null
      },
      
      // API state
      api: {
        health: null,
        status: 'unknown',
        latency: null,
        errors: []
      },
      
      // Sports data state
      sports: {
        cardinals: {
          readiness: null,
          analytics: null,
          liveMetrics: null,
          lastUpdated: null
        },
        titans: {
          performance: null,
          lastUpdated: null
        },
        grizzlies: {
          gritIndex: null,
          lastUpdated: null
        },
        longhorns: {
          recruiting: null,
          lastUpdated: null
        },
        dashboard: null
      },
      
      // UI state
      ui: {
        theme: 'dark',
        sidebarOpen: false,
        notifications: [],
        activeSection: 'dashboard',
        loading: {},
        errors: {}
      },
      
      // User preferences
      preferences: {
        autoRefresh: true,
        refreshInterval: 30000,
        notifications: true,
        animations: true,
        compactMode: false
      },
      
      // Real-time data
      realtime: {
        connected: false,
        lastHeartbeat: null,
        subscriptions: new Set(),
        buffer: []
      }
    };
    
    this.subscribers = new Map();
    this.middleware = [];
    this.history = [];
    this.maxHistorySize = 50;
    
    // Load persisted state
    this.loadPersistedState();
    
    // Setup auto-persistence
    this.setupAutoPersistence();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    
    this.subscribers.get(path).add(callback);
    
    // Return unsubscribe function
    return () => {
      const pathSubscribers = this.subscribers.get(path);
      if (pathSubscribers) {
        pathSubscribers.delete(callback);
        if (pathSubscribers.size === 0) {
          this.subscribers.delete(path);
        }
      }
    };
  }

  /**
   * Get state value by path
   */
  get(path) {
    return this.getNestedValue(this.state, path);
  }

  /**
   * Set state value by path
   */
  set(path, value, options = {}) {
    const oldValue = this.get(path);
    
    // Apply middleware
    for (const middleware of this.middleware) {
      value = middleware(path, value, oldValue, this.state);
    }
    
    // Update state
    this.setNestedValue(this.state, path, value);
    
    // Add to history
    if (!options.skipHistory) {
      this.addToHistory(path, oldValue, value);
    }
    
    // Notify subscribers
    this.notifySubscribers(path, value, oldValue);
    
    // Auto-persist if enabled
    if (!options.skipPersistence) {
      this.scheduleStatePersistence();
    }
    
    return value;
  }

  /**
   * Update state with partial object
   */
  update(path, updates, options = {}) {
    const currentValue = this.get(path) || {};
    const newValue = { ...currentValue, ...updates };
    return this.set(path, newValue, options);
  }

  /**
   * Reset state path to initial value
   */
  reset(path) {
    const initialValue = this.getInitialValue(path);
    return this.set(path, initialValue);
  }

  /**
   * Add middleware for state transformations
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Specialized methods for common operations
   */
  
  // System state
  setSystemLoading(loading) {
    return this.set('system.loading', loading);
  }

  setSystemError(error) {
    return this.set('system.error', error);
  }

  initializeSystem(environment, version) {
    return this.update('system', {
      initialized: true,
      environment,
      version,
      timestamp: new Date().toISOString()
    });
  }

  // API state
  updateApiHealth(health) {
    return this.update('api', {
      health,
      status: health?.status || 'unknown',
      latency: health?.latency || null
    });
  }

  addApiError(error) {
    const errors = this.get('api.errors') || [];
    const newErrors = [...errors, {
      error,
      timestamp: new Date().toISOString()
    }].slice(-10); // Keep only last 10 errors
    
    return this.set('api.errors', newErrors);
  }

  // Sports data
  updateCardinalsData(type, data) {
    return this.update(`sports.cardinals.${type}`, data);
  }

  updateSportsTeam(team, data) {
    return this.update(`sports.${team}`, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  }

  updateMultiSportDashboard(dashboard) {
    return this.set('sports.dashboard', dashboard);
  }

  // UI state
  setActiveSection(section) {
    return this.set('ui.activeSection', section);
  }

  toggleSidebar() {
    const isOpen = this.get('ui.sidebarOpen');
    return this.set('ui.sidebarOpen', !isOpen);
  }

  addNotification(notification) {
    const notifications = this.get('ui.notifications') || [];
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...notification
    };
    
    return this.set('ui.notifications', [...notifications, newNotification]);
  }

  removeNotification(id) {
    const notifications = this.get('ui.notifications') || [];
    return this.set('ui.notifications', notifications.filter(n => n.id !== id));
  }

  setUILoading(component, loading) {
    return this.update('ui.loading', { [component]: loading });
  }

  setUIError(component, error) {
    return this.update('ui.errors', { [component]: error });
  }

  // User preferences
  updatePreferences(preferences) {
    return this.update('preferences', preferences);
  }

  togglePreference(key) {
    const current = this.get(`preferences.${key}`);
    return this.set(`preferences.${key}`, !current);
  }

  // Real-time state
  setRealtimeConnection(connected) {
    return this.update('realtime', {
      connected,
      lastHeartbeat: connected ? new Date().toISOString() : null
    });
  }

  addRealtimeSubscription(subscription) {
    const subscriptions = this.get('realtime.subscriptions');
    subscriptions.add(subscription);
    return this.set('realtime.subscriptions', subscriptions, { skipPersistence: true });
  }

  removeRealtimeSubscription(subscription) {
    const subscriptions = this.get('realtime.subscriptions');
    subscriptions.delete(subscription);
    return this.set('realtime.subscriptions', subscriptions, { skipPersistence: true });
  }

  /**
   * Utility methods
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  getInitialValue(path) {
    // Return appropriate initial values based on path
    const pathSegments = path.split('.');
    if (pathSegments[0] === 'system') return null;
    if (pathSegments[0] === 'api') return null;
    if (pathSegments[0] === 'sports') return {};
    if (pathSegments[0] === 'ui') return {};
    return null;
  }

  notifySubscribers(path, newValue, oldValue) {
    // Notify exact path subscribers
    const pathSubscribers = this.subscribers.get(path);
    if (pathSubscribers) {
      pathSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
    
    // Notify parent path subscribers
    const pathParts = path.split('.');
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = pathParts.slice(0, i).join('.');
      const parentSubscribers = this.subscribers.get(parentPath);
      if (parentSubscribers) {
        parentSubscribers.forEach(callback => {
          try {
            callback(this.get(parentPath), null, parentPath);
          } catch (error) {
            console.error('Parent subscriber callback error:', error);
          }
        });
      }
    }
  }

  addToHistory(path, oldValue, newValue) {
    this.history.push({
      path,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    });
    
    // Trim history to max size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Persistence methods
   */
  loadPersistedState() {
    try {
      const persistedState = localStorage.getItem('blaze-state');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        
        // Only restore certain parts of the state
        this.state.preferences = { ...this.state.preferences, ...parsed.preferences };
        this.state.ui.theme = parsed.ui?.theme || this.state.ui.theme;
        this.state.ui.activeSection = parsed.ui?.activeSection || this.state.ui.activeSection;
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }

  scheduleStatePersistence() {
    if (this.persistenceTimeout) {
      clearTimeout(this.persistenceTimeout);
    }
    
    this.persistenceTimeout = setTimeout(() => {
      this.persistState();
    }, 1000); // Debounce persistence by 1 second
  }

  persistState() {
    try {
      const stateToPersist = {
        preferences: this.state.preferences,
        ui: {
          theme: this.state.ui.theme,
          activeSection: this.state.ui.activeSection
        },
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('blaze-state', JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }

  setupAutoPersistence() {
    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      this.persistState();
    });
    
    // Save state periodically
    setInterval(() => {
      this.persistState();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Debug methods
   */
  getFullState() {
    return { ...this.state };
  }

  getHistory() {
    return [...this.history];
  }

  getSubscribers() {
    const result = {};
    this.subscribers.forEach((subscribers, path) => {
      result[path] = subscribers.size;
    });
    return result;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.subscribers.clear();
    this.middleware = [];
    this.history = [];
    
    if (this.persistenceTimeout) {
      clearTimeout(this.persistenceTimeout);
    }
  }
}

// Create singleton instance
let stateManagerInstance = null;

export function createStateManager() {
  if (!stateManagerInstance) {
    stateManagerInstance = new BlazeStateManager();
  }
  return stateManagerInstance;
}

export function getStateManager() {
  if (!stateManagerInstance) {
    stateManagerInstance = new BlazeStateManager();
  }
  return stateManagerInstance;
}

// Browser/Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeStateManager, createStateManager, getStateManager };
} else if (typeof window !== 'undefined') {
  window.BlazeStateManager = BlazeStateManager;
  window.createStateManager = createStateManager;
  window.getStateManager = getStateManager;
}