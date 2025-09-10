/**
 * Enhanced Dynamic Content Loading System - Blaze Intelligence
 * Provides real-time data updates and improved user experience
 */

class BlazeContentLoader {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || '/api',
      updateInterval: config.updateInterval || 30000, // 30 seconds
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5000, // 5 seconds
      enableCache: config.enableCache !== false,
      cacheTimeout: config.cacheTimeout || 60000, // 1 minute
      ...config
    };
    
    this.cache = new Map();
    this.updateTimers = new Map();
    this.retryCounters = new Map();
    this.loadingStates = new Map();
    this.errorStates = new Map();
    
    this.init();
  }
  
  init() {
    console.log('🚀 Blaze Content Loader initialized');
    this.setupErrorHandling();
    this.startHealthCheck();
  }
  
  setupErrorHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      this.showErrorNotification('System error occurred', 'error');
    });
  }
  
  /**
   * Health check to monitor API availability
   */
  async startHealthCheck() {
    const checkHealth = async () => {
      try {
        const response = await this.makeRequest('/api/enhanced-gateway?endpoint=health');
        if (response.success) {
          this.clearErrorState('system');
          this.updateSystemStatus('operational');
        } else {
          throw new Error('Health check failed');
        }
      } catch (error) {
        console.warn('🔸 Health check failed:', error.message);
        this.setErrorState('system', 'API health check failed');
        this.updateSystemStatus('degraded');
      }
      
      // Check every 2 minutes
      setTimeout(checkHealth, 2 * 60 * 1000);
    };
    
    checkHealth();
  }
  
  /**
   * Enhanced request handling with retries and caching
   */
  async makeRequest(url, options = {}) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return { ...cached.data, cached: true };
      }
    }
    
    const retryKey = `request-${url}`;
    const currentRetries = this.retryCounters.get(retryKey) || 0;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Reset retry counter on success
      this.retryCounters.set(retryKey, 0);
      
      // Cache the response
      if (this.config.enableCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      console.error(`🔴 Request failed [${url}]:`, error.message);
      
      // Handle retries
      if (currentRetries < this.config.maxRetries) {
        this.retryCounters.set(retryKey, currentRetries + 1);
        console.log(`🔄 Retrying request (${currentRetries + 1}/${this.config.maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.makeRequest(url, options);
      }
      
      // Max retries exceeded
      this.retryCounters.set(retryKey, 0);
      throw error;
    }
  }
  
  /**
   * Load and update Cardinals analytics with enhanced UI feedback
   */
  async loadCardinalsAnalytics() {
    const elementId = 'cardinals-analytics';
    
    try {
      this.setLoadingState(elementId, true);
      this.clearErrorState(elementId);
      
      const response = await this.makeRequest('/api/enhanced-gateway?endpoint=cardinals-analytics');
      
      if (response.success) {
        this.updateCardinalsUI(response.data, response.meta);
        this.setLoadingState(elementId, false);
        
        // Schedule next update
        this.scheduleUpdate('cardinals', () => this.loadCardinalsAnalytics());
      } else {
        throw new Error('Failed to load Cardinals analytics');
      }
    } catch (error) {
      console.error('❌ Cardinals analytics loading failed:', error);
      this.setErrorState(elementId, error.message);
      this.setLoadingState(elementId, false);
      this.showErrorNotification('Failed to load Cardinals data', 'warning');
    }
  }
  
  /**
   * Update Cardinals UI with enhanced data visualization
   */
  updateCardinalsUI(data, meta) {
    // Update readiness score with animation
    const readinessElement = document.getElementById('cardinals-readiness');
    if (readinessElement) {
      this.animateNumber(readinessElement, parseFloat(data.performance.overall), 1, '%');
    }
    
    // Update trend indicator
    const trendElement = document.getElementById('cardinals-trend');
    if (trendElement) {
      const trendIcon = data.performance.trend === 'up' ? '📈' : 
                      data.performance.trend === 'down' ? '📉' : '📊';
      trendElement.innerHTML = `${trendIcon} ${data.performance.trend.toUpperCase()}`;
      trendElement.className = `trend-indicator trend-${data.performance.trend}`;
    }
    
    // Update confidence score
    const confidenceElement = document.getElementById('cardinals-confidence');
    if (confidenceElement) {
      this.animateNumber(confidenceElement, parseFloat(data.performance.confidence), 1, '%');
    }
    
    // Update player insights
    this.updatePlayerInsights(data.playerInsights);
    
    // Update predictive analysis
    this.updatePredictiveAnalysis(data.predictive);
    
    // Update metadata
    this.updateDataTimestamp(meta);
  }
  
  /**
   * Load multi-sport dashboard with enhanced visualizations
   */
  async loadMultiSportDashboard() {
    const elementId = 'multi-sport-dashboard';
    
    try {
      this.setLoadingState(elementId, true);
      this.clearErrorState(elementId);
      
      const response = await this.makeRequest('/api/enhanced-gateway?endpoint=multi-sport-dashboard');
      
      if (response.success) {
        this.updateDashboardUI(response.data, response.meta);
        this.setLoadingState(elementId, false);
        
        // Schedule next update
        this.scheduleUpdate('dashboard', () => this.loadMultiSportDashboard());
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Dashboard loading failed:', error);
      this.setErrorState(elementId, error.message);
      this.setLoadingState(elementId, false);
    }
  }
  
  /**
   * Update dashboard UI with team status cards
   */
  updateDashboardUI(data, meta) {
    const dashboardContainer = document.getElementById('dashboard-teams');
    if (!dashboardContainer) return;
    
    // Update each team card
    Object.entries(data.teams).forEach(([teamKey, teamData]) => {
      const teamCard = document.getElementById(`team-${teamKey}`);
      if (teamCard) {
        this.updateTeamCard(teamCard, teamKey, teamData);
      }
    });
    
    // Update system status
    this.updateSystemStatus(data.system);
    
    // Update insights
    this.updateInsights(data.insights);
  }
  
  /**
   * Load real-time notifications
   */
  async loadNotifications() {
    try {
      const response = await this.makeRequest('/api/enhanced-gateway?endpoint=notifications');
      
      if (response.success && response.data.notifications) {
        this.updateNotificationsUI(response.data);
        
        // Schedule next notification check
        this.scheduleUpdate('notifications', () => this.loadNotifications(), 15000); // 15 seconds
      }
    } catch (error) {
      console.error('❌ Notifications loading failed:', error);
    }
  }
  
  /**
   * Update notifications UI with toast notifications
   */
  updateNotificationsUI(data) {
    const notificationContainer = document.getElementById('notifications-container');
    if (!notificationContainer) return;
    
    // Clear existing notifications
    notificationContainer.innerHTML = '';
    
    // Add new notifications
    data.notifications.forEach(notification => {
      const notificationElement = this.createNotificationElement(notification);
      notificationContainer.appendChild(notificationElement);
    });
    
    // Update notification badge
    const badge = document.getElementById('notification-badge');
    if (badge) {
      badge.textContent = data.count;
      badge.style.display = data.count > 0 ? 'block' : 'none';
    }
  }
  
  /**
   * Create notification element
   */
  createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification notification-${notification.type}`;
    element.innerHTML = `
      <div class=\"notification-header\">
        <strong>${notification.title}</strong>
        <span class=\"notification-time\">${this.formatTimeAgo(notification.timestamp)}</span>
      </div>
      <div class=\"notification-body\">${notification.message}</div>
    `;
    
    // Auto-dismiss after 5 seconds for info notifications
    if (notification.type === 'info') {
      setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => element.remove(), 300);
      }, 5000);
    }
    
    return element;
  }
  
  /**
   * Enhanced number animation
   */
  animateNumber(element, target, decimals = 0, suffix = '') {
    const start = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * easeOut;
      
      element.textContent = current.toFixed(decimals) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  /**
   * Schedule automatic updates
   */
  scheduleUpdate(key, updateFunction, interval = null) {
    // Clear existing timer
    if (this.updateTimers.has(key)) {
      clearTimeout(this.updateTimers.get(key));
    }
    
    const updateInterval = interval || this.config.updateInterval;
    const timer = setTimeout(() => {
      updateFunction();
    }, updateInterval);
    
    this.updateTimers.set(key, timer);
  }
  
  /**
   * Loading state management
   */
  setLoadingState(elementId, isLoading) {
    this.loadingStates.set(elementId, isLoading);
    
    const element = document.getElementById(elementId);
    if (element) {
      if (isLoading) {
        element.classList.add('loading');
        this.showLoadingSpinner(element);
      } else {
        element.classList.remove('loading');
        this.hideLoadingSpinner(element);
      }
    }
  }
  
  /**
   * Error state management
   */
  setErrorState(elementId, errorMessage) {
    this.errorStates.set(elementId, errorMessage);
    
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('error');
      this.showErrorMessage(element, errorMessage);
    }
  }
  
  clearErrorState(elementId) {
    this.errorStates.delete(elementId);
    
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('error');
      this.hideErrorMessage(element);
    }
  }
  
  /**
   * Show loading spinner
   */
  showLoadingSpinner(element) {
    let spinner = element.querySelector('.loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      spinner.innerHTML = '⚡ Loading...';
      element.appendChild(spinner);
    }
  }
  
  hideLoadingSpinner(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }
  
  /**
   * Utility functions
   */
  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }
  
  showErrorNotification(message, type = 'error') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  updateSystemStatus(status) {
    const statusElement = document.getElementById('system-status');
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = `system-status status-${status}`;
    }
  }
  
  /**
   * Initialize all content loading
   */
  async loadAll() {
    console.log('🔄 Loading all content...');
    
    // Load different sections in parallel
    const loadPromises = [
      this.loadCardinalsAnalytics(),
      this.loadMultiSportDashboard(),
      this.loadNotifications()
    ];
    
    try {
      await Promise.allSettled(loadPromises);
      console.log('✅ All content loaded successfully');
    } catch (error) {
      console.error('❌ Some content failed to load:', error);
    }
  }
  
  /**
   * Cleanup function
   */
  destroy() {
    // Clear all timers
    this.updateTimers.forEach(timer => clearTimeout(timer));
    this.updateTimers.clear();
    
    // Clear cache
    this.cache.clear();
    
    console.log('🧹 Blaze Content Loader destroyed');
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  let blazeLoader;
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Initializing Blaze Content Loader...');
    
    blazeLoader = new BlazeContentLoader({
      updateInterval: 30000, // 30 seconds
      enableCache: true,
      cacheTimeout: 60000 // 1 minute cache
    });
    
    // Load initial content
    blazeLoader.loadAll();
    
    // Global access
    window.blazeLoader = blazeLoader;
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (blazeLoader) {
      blazeLoader.destroy();
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlazeContentLoader;
}