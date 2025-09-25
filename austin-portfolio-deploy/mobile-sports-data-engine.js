/**
 * BLAZE SPORTS INTEL - MOBILE SPORTS DATA ENGINE
 * Real-time sports analytics optimized for mobile devices
 * Intelligent data management with offline-first architecture
 */

/**
 * Mobile Sports Data Engine
 * Handles real-time sports data with mobile-specific optimizations
 */
class MobileSportsDataEngine {
    constructor() {
        this.isOnline = navigator.onLine;
        this.dataCache = new Map();
        this.subscriptions = new Map();
        this.requestQueue = [];
        this.batchTimeout = null;
        this.isLowPowerMode = false;

        // Mobile-optimized configuration
        this.config = {
            batchDelay: 100,           // Batch requests for 100ms
            cacheTimeout: 300000,      // 5 minutes cache for mobile
            maxCacheSize: 50,          // Limit cached items
            retryDelay: 2000,          // 2s retry delay
            maxRetries: 3,             // Max 3 retries for mobile
            compressionEnabled: true,   // Enable data compression
            adaptivePolling: true,     // Adjust polling based on battery
            offlineQueueSize: 100      // Max offline actions
        };

        // Supported sports data endpoints
        this.endpoints = {
            cardinals: {
                live: '/api/cardinals-live',
                roster: '/api/cardinals-roster',
                stats: '/api/cardinals-stats',
                schedule: '/api/cardinals-schedule',
                readiness: '/api/cardinals-readiness'
            },
            titans: {
                live: '/api/titans-live',
                roster: '/api/titans-roster',
                stats: '/api/titans-stats',
                schedule: '/api/titans-schedule',
                depth: '/api/titans-depth-chart'
            },
            longhorns: {
                live: '/api/longhorns-live',
                roster: '/api/longhorns-roster',
                stats: '/api/longhorns-stats',
                schedule: '/api/longhorns-schedule',
                recruiting: '/api/longhorns-recruiting'
            },
            grizzlies: {
                live: '/api/grizzlies-live',
                roster: '/api/grizzlies-roster',
                stats: '/api/grizzlies-stats',
                schedule: '/api/grizzlies-schedule',
                trade: '/api/grizzlies-trade-rumors'
            },
            leagues: {
                mlb: '/api/mlb-scores',
                nfl: '/api/nfl-scores',
                nba: '/api/nba-scores',
                ncaa: '/api/ncaa-scores',
                perfectGame: '/api/perfect-game-data',
                texasHS: '/api/texas-hs-football'
            },
            analytics: {
                nil: '/api/nil-calculator',
                performance: '/api/performance-metrics',
                predictions: '/api/predictions',
                weather: '/api/game-weather',
                injuries: '/api/injury-reports'
            }
        };

        // Real-time data categories
        this.dataTypes = {
            LIVE_SCORE: 'live_score',
            PLAYER_STAT: 'player_stat',
            TEAM_UPDATE: 'team_update',
            GAME_EVENT: 'game_event',
            ROSTER_CHANGE: 'roster_change',
            INJURY_UPDATE: 'injury_update',
            WEATHER_UPDATE: 'weather_update',
            PREDICTION_UPDATE: 'prediction_update'
        };

        this.initializeMobileOptimizations();
        this.setupEventListeners();
        this.initializeBatteryMonitoring();
        this.startDataEngine();
    }

    /**
     * Initialize mobile-specific optimizations
     */
    initializeMobileOptimizations() {
        // Detect mobile device capabilities
        this.deviceInfo = {
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Android.*(?=.*\btablet\b)/i.test(navigator.userAgent),
            connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
            memory: navigator.deviceMemory || 4,
            hardwareConcurrency: navigator.hardwareConcurrency || 4
        };

        // Adjust config based on device capabilities
        if (this.deviceInfo.isMobile && !this.deviceInfo.isTablet) {
            this.config.cacheTimeout = 600000; // 10 minutes for mobile
            this.config.maxCacheSize = 25;
            this.config.batchDelay = 200;
        }

        // Adjust for low-memory devices
        if (this.deviceInfo.memory <= 2) {
            this.config.maxCacheSize = 10;
            this.config.compressionEnabled = true;
        }

        // Adjust for slow connections
        if (this.deviceInfo.connection && this.deviceInfo.connection.effectiveType === 'slow-2g') {
            this.config.batchDelay = 500;
            this.config.cacheTimeout = 1800000; // 30 minutes
        }

        console.log('[Mobile Data Engine] Initialized with config:', this.config);
    }

    /**
     * Setup event listeners for network and battery changes
     */
    setupEventListeners() {
        // Network status monitoring
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
            this.notifySubscribers('network', { status: 'online' });
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifySubscribers('network', { status: 'offline' });
        });

        // Page visibility for power management
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pausePolling();
            } else {
                this.resumePolling();
            }
        });

        // Connection change monitoring
        if (this.deviceInfo.connection) {
            this.deviceInfo.connection.addEventListener('change', () => {
                this.adaptToConnectionChange();
            });
        }
    }

    /**
     * Initialize battery monitoring for power-aware operations
     */
    async initializeBatteryMonitoring() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();

                this.updateBatteryStatus(battery);

                battery.addEventListener('levelchange', () => this.updateBatteryStatus(battery));
                battery.addEventListener('chargingchange', () => this.updateBatteryStatus(battery));
                battery.addEventListener('dischargingtimechange', () => this.updateBatteryStatus(battery));

                console.log('[Mobile Data Engine] Battery monitoring initialized');
            }
        } catch (error) {
            console.warn('[Mobile Data Engine] Battery API not available:', error);
        }
    }

    /**
     * Update battery status and adjust operations
     */
    updateBatteryStatus(battery) {
        const wasLowPowerMode = this.isLowPowerMode;
        this.isLowPowerMode = battery.level < 0.20 ||
                              (!battery.charging && battery.dischargingTime < 3600);

        if (this.isLowPowerMode && !wasLowPowerMode) {
            console.log('[Mobile Data Engine] Entering low power mode');
            this.enableLowPowerMode();
        } else if (!this.isLowPowerMode && wasLowPowerMode) {
            console.log('[Mobile Data Engine] Exiting low power mode');
            this.disableLowPowerMode();
        }

        // Notify service worker of battery status
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_BATTERY_STATUS',
                payload: {
                    level: battery.level,
                    charging: battery.charging,
                    dischargingTime: battery.dischargingTime
                }
            });
        }
    }

    /**
     * Start the mobile data engine
     */
    startDataEngine() {
        console.log('[Mobile Data Engine] Starting data engine...');

        // Initialize IndexedDB for offline storage
        this.initializeOfflineStorage();

        // Start adaptive polling
        this.startAdaptivePolling();

        // Initialize WebSocket connections for real-time data
        this.initializeWebSockets();

        // Setup periodic cache cleanup
        setInterval(() => this.cleanupCache(), 300000); // Every 5 minutes

        console.log('[Mobile Data Engine] Data engine started successfully');
    }

    /**
     * Initialize IndexedDB for offline data storage
     */
    initializeOfflineStorage() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BlazeIntelDB', 2);

            request.onerror = () => {
                console.error('[Mobile Data Engine] IndexedDB failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[Mobile Data Engine] IndexedDB initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('sportsData')) {
                    const sportsStore = db.createObjectStore('sportsData', { keyPath: 'id' });
                    sportsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    sportsStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('offlineActions')) {
                    db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains('userPreferences')) {
                    db.createObjectStore('userPreferences', { keyPath: 'key' });
                }

                console.log('[Mobile Data Engine] IndexedDB schema updated');
            };
        });
    }

    /**
     * Get live sports data with mobile optimizations
     */
    async getLiveData(team, dataType = 'live') {
        const cacheKey = `${team}-${dataType}`;

        // Check cache first
        const cached = this.dataCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.config.cacheTimeout) {
            return cached.data;
        }

        if (!this.isOnline) {
            // Try to get from offline storage
            const offlineData = await this.getOfflineData(cacheKey);
            if (offlineData) {
                return offlineData;
            }

            throw new Error('Data not available offline');
        }

        try {
            const endpoint = this.endpoints[team]?.[dataType];
            if (!endpoint) {
                throw new Error(`Endpoint not found for ${team} ${dataType}`);
            }

            // Add to batch request if applicable
            if (this.config.batchDelay > 0) {
                return this.addToBatch(endpoint, cacheKey);
            }

            const data = await this.fetchWithRetry(endpoint);

            // Cache the data
            this.cacheData(cacheKey, data);

            // Store offline for future use
            await this.storeOfflineData(cacheKey, data);

            return data;

        } catch (error) {
            console.error(`[Mobile Data Engine] Failed to get live data for ${team}:`, error);

            // Try offline data as fallback
            const offlineData = await this.getOfflineData(cacheKey);
            if (offlineData) {
                return { ...offlineData, isStale: true };
            }

            throw error;
        }
    }

    /**
     * Get Cardinals specific analytics data
     */
    async getCardinalsAnalytics() {
        try {
            const [liveData, stats, readiness] = await Promise.allSettled([
                this.getLiveData('cardinals', 'live'),
                this.getLiveData('cardinals', 'stats'),
                this.getLiveData('cardinals', 'readiness')
            ]);

            return {
                live: liveData.status === 'fulfilled' ? liveData.value : null,
                stats: stats.status === 'fulfilled' ? stats.value : null,
                readiness: readiness.status === 'fulfilled' ? readiness.value : null,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('[Mobile Data Engine] Cardinals analytics failed:', error);
            throw error;
        }
    }

    /**
     * Get NIL (Name, Image, Likeness) valuation data
     */
    async getNILValuation(playerData) {
        try {
            const response = await this.fetchWithRetry(this.endpoints.analytics.nil, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(playerData)
            });

            return response;
        } catch (error) {
            console.error('[Mobile Data Engine] NIL valuation failed:', error);
            throw error;
        }
    }

    /**
     * Get Perfect Game youth baseball data
     */
    async getPerfectGameData(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const endpoint = `${this.endpoints.leagues.perfectGame}?${queryParams}`;

            return await this.fetchWithRetry(endpoint);
        } catch (error) {
            console.error('[Mobile Data Engine] Perfect Game data failed:', error);
            throw error;
        }
    }

    /**
     * Get Texas High School Football data
     */
    async getTexasHSFootball(week = 'current') {
        try {
            const endpoint = `${this.endpoints.leagues.texasHS}?week=${week}`;
            return await this.fetchWithRetry(endpoint);
        } catch (error) {
            console.error('[Mobile Data Engine] Texas HS Football data failed:', error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time data updates
     */
    subscribe(dataType, callback) {
        const subscriptionId = `${dataType}-${Date.now()}-${Math.random()}`;

        if (!this.subscriptions.has(dataType)) {
            this.subscriptions.set(dataType, new Map());
        }

        this.subscriptions.get(dataType).set(subscriptionId, callback);

        console.log(`[Mobile Data Engine] Subscribed to ${dataType} with ID ${subscriptionId}`);

        return {
            unsubscribe: () => {
                const typeSubscriptions = this.subscriptions.get(dataType);
                if (typeSubscriptions) {
                    typeSubscriptions.delete(subscriptionId);
                    if (typeSubscriptions.size === 0) {
                        this.subscriptions.delete(dataType);
                    }
                }
                console.log(`[Mobile Data Engine] Unsubscribed from ${dataType}`);
            }
        };
    }

    /**
     * Notify subscribers of data updates
     */
    notifySubscribers(dataType, data) {
        const typeSubscriptions = this.subscriptions.get(dataType);
        if (typeSubscriptions) {
            typeSubscriptions.forEach((callback, id) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[Mobile Data Engine] Subscription callback error for ${id}:`, error);
                }
            });
        }
    }

    /**
     * Initialize WebSocket connections for real-time updates
     */
    initializeWebSockets() {
        if (this.isLowPowerMode) {
            console.log('[Mobile Data Engine] Skipping WebSocket in low power mode');
            return;
        }

        try {
            // Cardinals real-time updates
            this.cardinalsWS = new WebSocket('wss://api.blazesportsintel.com/ws/cardinals');
            this.setupWebSocket(this.cardinalsWS, 'cardinals');

            // League-wide updates
            this.leagueWS = new WebSocket('wss://api.blazesportsintel.com/ws/leagues');
            this.setupWebSocket(this.leagueWS, 'leagues');

        } catch (error) {
            console.error('[Mobile Data Engine] WebSocket initialization failed:', error);
        }
    }

    /**
     * Setup individual WebSocket connection
     */
    setupWebSocket(ws, type) {
        ws.onopen = () => {
            console.log(`[Mobile Data Engine] ${type} WebSocket connected`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleRealtimeUpdate(data);
            } catch (error) {
                console.error(`[Mobile Data Engine] ${type} WebSocket message error:`, error);
            }
        };

        ws.onclose = () => {
            console.log(`[Mobile Data Engine] ${type} WebSocket disconnected`);
            // Attempt to reconnect after delay
            setTimeout(() => {
                if (this.isOnline && !this.isLowPowerMode) {
                    this.initializeWebSockets();
                }
            }, this.config.retryDelay);
        };

        ws.onerror = (error) => {
            console.error(`[Mobile Data Engine] ${type} WebSocket error:`, error);
        };
    }

    /**
     * Handle real-time data updates
     */
    handleRealtimeUpdate(update) {
        // Cache the update
        const cacheKey = `${update.team || 'general'}-${update.type}`;
        this.cacheData(cacheKey, update.data);

        // Notify subscribers
        this.notifySubscribers(update.type, update);
        this.notifySubscribers('realtime', update);

        // Store offline
        this.storeOfflineData(cacheKey, update.data);
    }

    /**
     * Fetch data with retry logic and mobile optimizations
     */
    async fetchWithRetry(url, options = {}, retries = this.config.maxRetries) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for mobile

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                let data = await response.json();

                // Decompress if needed
                if (this.config.compressionEnabled && data.compressed) {
                    data = this.decompressData(data);
                }

                return data;

            } catch (error) {
                console.warn(`[Mobile Data Engine] Fetch attempt ${attempt + 1} failed:`, error.message);

                if (attempt < retries) {
                    await this.delay(this.config.retryDelay * (attempt + 1));
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Cache data with size and time limits
     */
    cacheData(key, data) {
        // Clean cache if it's getting too large
        if (this.dataCache.size >= this.config.maxCacheSize) {
            const oldestKey = [...this.dataCache.keys()][0];
            this.dataCache.delete(oldestKey);
        }

        this.dataCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Store data for offline access
     */
    async storeOfflineData(key, data) {
        if (!this.db) return;

        try {
            const transaction = this.db.transaction(['sportsData'], 'readwrite');
            const store = transaction.objectStore('sportsData');

            await store.put({
                id: key,
                data,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('[Mobile Data Engine] Failed to store offline data:', error);
        }
    }

    /**
     * Get data from offline storage
     */
    async getOfflineData(key) {
        if (!this.db) return null;

        try {
            const transaction = this.db.transaction(['sportsData'], 'readonly');
            const store = transaction.objectStore('sportsData');
            const result = await store.get(key);

            return result ? result.data : null;

        } catch (error) {
            console.error('[Mobile Data Engine] Failed to get offline data:', error);
            return null;
        }
    }

    /**
     * Add request to batch for efficient processing
     */
    addToBatch(endpoint, cacheKey) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, cacheKey, resolve, reject });

            if (this.batchTimeout) {
                clearTimeout(this.batchTimeout);
            }

            this.batchTimeout = setTimeout(() => {
                this.processBatchedRequests();
            }, this.config.batchDelay);
        });
    }

    /**
     * Process batched requests for efficiency
     */
    async processBatchedRequests() {
        const batch = [...this.requestQueue];
        this.requestQueue = [];
        this.batchTimeout = null;

        if (batch.length === 0) return;

        try {
            // Group requests by endpoint
            const groupedRequests = batch.reduce((groups, request) => {
                if (!groups[request.endpoint]) {
                    groups[request.endpoint] = [];
                }
                groups[request.endpoint].push(request);
                return groups;
            }, {});

            // Process each group
            const promises = Object.entries(groupedRequests).map(async ([endpoint, requests]) => {
                try {
                    const data = await this.fetchWithRetry(endpoint);

                    requests.forEach(request => {
                        this.cacheData(request.cacheKey, data);
                        this.storeOfflineData(request.cacheKey, data);
                        request.resolve(data);
                    });

                } catch (error) {
                    requests.forEach(request => {
                        request.reject(error);
                    });
                }
            });

            await Promise.all(promises);

        } catch (error) {
            console.error('[Mobile Data Engine] Batch processing failed:', error);
        }
    }

    /**
     * Start adaptive polling based on device conditions
     */
    startAdaptivePolling() {
        if (!this.config.adaptivePolling) return;

        this.pollingInterval = setInterval(() => {
            if (!this.isOnline || this.isLowPowerMode || document.hidden) {
                return;
            }

            // Poll critical data sources
            this.pollCriticalData();

        }, this.calculatePollingInterval());

        console.log('[Mobile Data Engine] Adaptive polling started');
    }

    /**
     * Calculate polling interval based on conditions
     */
    calculatePollingInterval() {
        let baseInterval = 30000; // 30 seconds

        if (this.isLowPowerMode) {
            baseInterval *= 4; // Reduce polling in low power mode
        }

        if (this.deviceInfo.connection) {
            const effectiveType = this.deviceInfo.connection.effectiveType;
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                baseInterval *= 3;
            } else if (effectiveType === '3g') {
                baseInterval *= 1.5;
            }
        }

        return Math.min(baseInterval, 300000); // Max 5 minutes
    }

    /**
     * Poll critical data sources
     */
    async pollCriticalData() {
        try {
            // Poll Cardinals readiness (most critical)
            await this.getLiveData('cardinals', 'readiness');

            // Poll live scores if in season
            if (this.isInSeason()) {
                await Promise.allSettled([
                    this.getLiveData('cardinals', 'live'),
                    this.getLiveData('titans', 'live'),
                    this.getLiveData('longhorns', 'live'),
                    this.getLiveData('grizzlies', 'live')
                ]);
            }

        } catch (error) {
            console.error('[Mobile Data Engine] Polling failed:', error);
        }
    }

    /**
     * Check if we're currently in sports season
     */
    isInSeason() {
        const month = new Date().getMonth();
        // MLB: March-October, NFL: August-February, NBA: October-June
        return month >= 2 && month <= 10; // Simplified check
    }

    /**
     * Enable low power mode optimizations
     */
    enableLowPowerMode() {
        // Reduce polling frequency
        this.config.adaptivePolling = false;

        // Close WebSocket connections
        if (this.cardinalsWS) {
            this.cardinalsWS.close();
            this.cardinalsWS = null;
        }
        if (this.leagueWS) {
            this.leagueWS.close();
            this.leagueWS = null;
        }

        // Increase cache timeout
        this.config.cacheTimeout = 1800000; // 30 minutes

        console.log('[Mobile Data Engine] Low power mode enabled');
    }

    /**
     * Disable low power mode optimizations
     */
    disableLowPowerMode() {
        // Restore normal configuration
        this.config.adaptivePolling = true;
        this.config.cacheTimeout = this.deviceInfo.isMobile ? 600000 : 300000;

        // Reinitialize WebSockets
        this.initializeWebSockets();

        console.log('[Mobile Data Engine] Low power mode disabled');
    }

    /**
     * Pause polling (when app is hidden)
     */
    pausePolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        console.log('[Mobile Data Engine] Polling paused');
    }

    /**
     * Resume polling (when app becomes visible)
     */
    resumePolling() {
        if (!this.pollingInterval && this.config.adaptivePolling) {
            this.startAdaptivePolling();
        }
        console.log('[Mobile Data Engine] Polling resumed');
    }

    /**
     * Adapt to connection changes
     */
    adaptToConnectionChange() {
        if (!this.deviceInfo.connection) return;

        const connection = this.deviceInfo.connection;
        console.log('[Mobile Data Engine] Connection changed:', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
        });

        // Adjust configuration based on connection quality
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            this.config.batchDelay = 1000;
            this.config.cacheTimeout = 1800000; // 30 minutes
        } else if (connection.effectiveType === '3g') {
            this.config.batchDelay = 300;
            this.config.cacheTimeout = 900000; // 15 minutes
        } else {
            this.config.batchDelay = 100;
            this.config.cacheTimeout = this.deviceInfo.isMobile ? 600000 : 300000;
        }
    }

    /**
     * Process offline action queue
     */
    async processOfflineQueue() {
        if (!this.db) return;

        try {
            const transaction = this.db.transaction(['offlineActions'], 'readonly');
            const store = transaction.objectStore('offlineActions');
            const actions = await store.getAll();

            if (actions.length === 0) return;

            console.log(`[Mobile Data Engine] Processing ${actions.length} offline actions`);

            // Process each action
            for (const action of actions) {
                try {
                    await this.processOfflineAction(action);

                    // Remove processed action
                    const deleteTransaction = this.db.transaction(['offlineActions'], 'readwrite');
                    const deleteStore = deleteTransaction.objectStore('offlineActions');
                    await deleteStore.delete(action.id);

                } catch (error) {
                    console.error('[Mobile Data Engine] Failed to process offline action:', error);
                }
            }

        } catch (error) {
            console.error('[Mobile Data Engine] Failed to process offline queue:', error);
        }
    }

    /**
     * Process individual offline action
     */
    async processOfflineAction(action) {
        switch (action.type) {
            case 'DATA_REQUEST':
                await this.fetchWithRetry(action.endpoint);
                break;
            case 'USER_PREFERENCE':
                // Sync user preferences
                break;
            default:
                console.warn('[Mobile Data Engine] Unknown offline action type:', action.type);
        }
    }

    /**
     * Clean up old cached data
     */
    cleanupCache() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of this.dataCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.dataCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[Mobile Data Engine] Cleaned ${cleaned} cached items`);
        }
    }

    /**
     * Decompress data if compression is enabled
     */
    decompressData(compressedData) {
        // Simple decompression logic - in production this would use proper compression
        return compressedData.data || compressedData;
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get engine status and statistics
     */
    getEngineStatus() {
        return {
            isOnline: this.isOnline,
            isLowPowerMode: this.isLowPowerMode,
            cacheSize: this.dataCache.size,
            maxCacheSize: this.config.maxCacheSize,
            subscriptions: this.subscriptions.size,
            queueSize: this.requestQueue.length,
            deviceInfo: this.deviceInfo,
            config: { ...this.config },
            uptime: Date.now() - this.startTime || Date.now()
        };
    }
}

// Export for use in mobile app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileSportsDataEngine;
} else if (typeof window !== 'undefined') {
    window.MobileSportsDataEngine = MobileSportsDataEngine;
}

console.log('[Mobile Sports Data Engine] Module loaded successfully');