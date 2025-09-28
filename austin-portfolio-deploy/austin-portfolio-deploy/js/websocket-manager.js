/**
 * ============================================================================
 * BLAZE SPORTS INTEL - REAL-TIME WEBSOCKET DATA MANAGER
 * High-Performance WebSocket Integration for 3D Graphics Engine
 * ============================================================================
 * Features: Auto-reconnection, Message Queuing, Data Validation, Performance Monitoring
 * Latency Target: <50ms for real-time sports data updates
 * Author: Austin Humphrey - blazesportsintel.com
 * ============================================================================
 */

class WebSocketManager {
    constructor(options = {}) {
        this.config = {
            url: options.url || this.getDefaultWebSocketURL(),
            protocols: options.protocols || ['blaze-sports-data'],
            reconnectInterval: options.reconnectInterval || 3000,
            maxReconnectAttempts: options.maxReconnectAttempts || 10,
            heartbeatInterval: options.heartbeatInterval || 30000,
            messageQueueSize: options.messageQueueSize || 1000,
            dataCompressionEnabled: options.dataCompressionEnabled || true,
            ...options
        };

        // Connection State
        this.connection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.lastConnectTime = 0;

        // Event Handling
        this.eventListeners = new Map();
        this.messageQueue = [];
        this.pendingMessages = new Map();

        // Performance Monitoring
        this.metrics = {
            messagesReceived: 0,
            messagesSent: 0,
            totalLatency: 0,
            averageLatency: 0,
            reconnections: 0,
            lastDataReceived: 0,
            bytesReceived: 0,
            bytesSent: 0
        };

        // Heartbeat & Health Monitoring
        this.heartbeatTimer = null;
        this.healthCheckTimer = null;

        // Auto-initialize
        this.initialize();
    }

    // ============================================================================
    // INITIALIZATION & CONNECTION MANAGEMENT
    // ============================================================================

    initialize() {
        console.log('🔗 Initializing Blaze Sports WebSocket Manager...');
        this.connect();
    }

    getDefaultWebSocketURL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/api/sports-data-stream`;
    }

    async connect() {
        if (this.isConnected || (this.connection && this.connection.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            console.log(`🔌 Connecting to WebSocket: ${this.config.url}`);
            this.lastConnectTime = performance.now();

            this.connection = new WebSocket(this.config.url, this.config.protocols);
            this.setupEventHandlers();

        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.handleConnectionError(error);
        }
    }

    setupEventHandlers() {
        if (!this.connection) return;

        this.connection.onopen = (event) => {
            this.handleConnectionOpen(event);
        };

        this.connection.onmessage = (event) => {
            this.handleMessage(event);
        };

        this.connection.onclose = (event) => {
            this.handleConnectionClose(event);
        };

        this.connection.onerror = (event) => {
            this.handleConnectionError(event);
        };
    }

    handleConnectionOpen(event) {
        console.log('✅ WebSocket connected successfully');

        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Start heartbeat
        this.startHeartbeat();

        // Send queued messages
        this.flushMessageQueue();

        // Emit connect event
        this.emit('connect', {
            timestamp: Date.now(),
            connectionTime: performance.now() - this.lastConnectTime
        });

        // Send initial handshake
        this.sendHandshake();
    }

    handleMessage(event) {
        const receiveTime = performance.now();
        this.metrics.messagesReceived++;
        this.metrics.lastDataReceived = receiveTime;

        try {
            const rawData = event.data;
            let data;

            // Handle different data formats
            if (typeof rawData === 'string') {
                data = JSON.parse(rawData);
                this.metrics.bytesReceived += rawData.length;
            } else if (rawData instanceof ArrayBuffer) {
                // Handle binary data (future enhancement for high-frequency data)
                data = this.decodeBinaryMessage(rawData);
                this.metrics.bytesReceived += rawData.byteLength;
            } else {
                console.warn('⚠️ Unknown message format:', typeof rawData);
                return;
            }

            // Calculate latency if timestamp is available
            if (data.timestamp) {
                const latency = receiveTime - data.timestamp;
                this.updateLatencyMetrics(latency);
            }

            // Validate message
            if (!this.validateMessage(data)) {
                console.warn('⚠️ Invalid message received:', data);
                return;
            }

            // Handle different message types
            this.processMessage(data);

        } catch (error) {
            console.error('❌ Error processing message:', error);
            this.emit('error', { type: 'message_processing', error });
        }
    }

    handleConnectionClose(event) {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);

        this.isConnected = false;
        this.stopHeartbeat();

        // Emit disconnect event
        this.emit('disconnect', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timestamp: Date.now()
        });

        // Attempt reconnection if not a clean close
        if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
        }
    }

    handleConnectionError(event) {
        console.error('❌ WebSocket error:', event);

        this.emit('error', {
            type: 'connection_error',
            event,
            timestamp: Date.now()
        });

        // Attempt reconnection
        this.scheduleReconnect();
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('💥 Max reconnection attempts reached');
            this.emit('max_reconnect_attempts');
            return;
        }

        this.reconnectAttempts++;
        this.metrics.reconnections++;

        const delay = Math.min(
            this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
            30000
        );

        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    // ============================================================================
    // MESSAGE HANDLING & PROCESSING
    // ============================================================================

    sendHandshake() {
        this.send({
            type: 'handshake',
            clientInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                timestamp: Date.now(),
                supportedFeatures: ['compression', 'binary', 'realtime']
            }
        });
    }

    processMessage(data) {
        switch (data.type) {
            case 'pong':
                this.handlePong(data);
                break;

            case 'sports_data':
                this.handleSportsData(data);
                break;

            case 'score_update':
                this.handleScoreUpdate(data);
                break;

            case 'player_stats':
                this.handlePlayerStats(data);
                break;

            case 'game_state':
                this.handleGameState(data);
                break;

            case 'injury_report':
                this.handleInjuryReport(data);
                break;

            case 'system_message':
                this.handleSystemMessage(data);
                break;

            default:
                console.log('📦 Unknown message type:', data.type);
                this.emit('unknown_message', data);
        }
    }

    handleSportsData(data) {
        // Emit data event for 3D engine consumption
        this.emit('data', data);

        // Cache data for offline scenarios
        this.cacheData(data);
    }

    handleScoreUpdate(data) {
        console.log('⚽ Score update:', data.game, data.score);
        this.emit('score_update', data);
    }

    handlePlayerStats(data) {
        console.log('📊 Player stats update:', data.player, data.stats);
        this.emit('player_stats', data);
    }

    handleGameState(data) {
        console.log('🏟️ Game state update:', data.state);
        this.emit('game_state', data);
    }

    handleInjuryReport(data) {
        console.log('🏥 Injury report:', data.player, data.status);
        this.emit('injury_update', data);
    }

    handleSystemMessage(data) {
        console.log('💬 System message:', data.message);
        this.emit('system_message', data);
    }

    handlePong(data) {
        const roundTripTime = performance.now() - data.pingTimestamp;
        this.updateLatencyMetrics(roundTripTime);
        console.log(`🏓 Pong received - RTT: ${roundTripTime.toFixed(2)}ms`);
    }

    validateMessage(data) {
        // Basic message validation
        if (!data || typeof data !== 'object') return false;
        if (!data.type || typeof data.type !== 'string') return false;

        // Type-specific validation
        switch (data.type) {
            case 'sports_data':
                return data.sport && data.data;
            case 'score_update':
                return data.game && data.score;
            case 'player_stats':
                return data.player && data.stats;
            default:
                return true;
        }
    }

    // ============================================================================
    // SENDING MESSAGES & QUEUE MANAGEMENT
    // ============================================================================

    send(data) {
        if (!this.isConnected || !this.connection || this.connection.readyState !== WebSocket.OPEN) {
            this.queueMessage(data);
            return false;
        }

        try {
            const message = JSON.stringify({
                ...data,
                timestamp: performance.now(),
                id: this.generateMessageId()
            });

            this.connection.send(message);
            this.metrics.messagesSent++;
            this.metrics.bytesSent += message.length;

            return true;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.queueMessage(data);
            return false;
        }
    }

    queueMessage(data) {
        if (this.messageQueue.length >= this.config.messageQueueSize) {
            // Remove oldest message
            this.messageQueue.shift();
        }

        this.messageQueue.push({
            data,
            timestamp: Date.now()
        });
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const queuedMessage = this.messageQueue.shift();
            this.send(queuedMessage.data);
        }
    }

    generateMessageId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================================================
    // HEARTBEAT & HEALTH MONITORING
    // ============================================================================

    startHeartbeat() {
        this.stopHeartbeat(); // Clear any existing timer

        this.heartbeatTimer = setInterval(() => {
            this.sendPing();
        }, this.config.heartbeatInterval);

        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.heartbeatInterval * 2);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }

    sendPing() {
        this.send({
            type: 'ping',
            pingTimestamp: performance.now()
        });
    }

    performHealthCheck() {
        const now = Date.now();
        const timeSinceLastData = now - this.metrics.lastDataReceived;

        // If no data received in 2x heartbeat interval, consider connection stale
        if (timeSinceLastData > this.config.heartbeatInterval * 2) {
            console.warn('⚠️ Connection appears stale, forcing reconnect');
            this.forceReconnect();
        }
    }

    forceReconnect() {
        if (this.connection) {
            this.connection.close(1000, 'Forced reconnect');
        }
    }

    // ============================================================================
    // PERFORMANCE MONITORING & METRICS
    // ============================================================================

    updateLatencyMetrics(latency) {
        this.metrics.totalLatency += latency;
        this.metrics.averageLatency = this.metrics.totalLatency / this.metrics.messagesReceived;

        // Emit performance warning if latency is high
        if (latency > 100) {
            console.warn(`⚠️ High latency detected: ${latency.toFixed(2)}ms`);
            this.emit('high_latency', { latency });
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            queueSize: this.messageQueue.length,
            connectionUptime: this.isConnected ? Date.now() - this.lastConnectTime : 0
        };
    }

    logMetrics() {
        const metrics = this.getMetrics();
        console.log('📊 WebSocket Performance Metrics:');
        console.log(`   └─ Status: ${metrics.isConnected ? '🟢 Connected' : '🔴 Disconnected'}`);
        console.log(`   └─ Messages: ${metrics.messagesReceived} received, ${metrics.messagesSent} sent`);
        console.log(`   └─ Average Latency: ${metrics.averageLatency.toFixed(2)}ms`);
        console.log(`   └─ Data Transfer: ${(metrics.bytesReceived / 1024).toFixed(2)}KB in, ${(metrics.bytesSent / 1024).toFixed(2)}KB out`);
        console.log(`   └─ Reconnections: ${metrics.reconnections}`);
        console.log(`   └─ Queue Size: ${metrics.queueSize}`);
    }

    // ============================================================================
    // DATA CACHING & OFFLINE SUPPORT
    // ============================================================================

    cacheData(data) {
        try {
            const cacheKey = `blaze_sports_${data.sport}_${data.type}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('⚠️ Failed to cache data:', error);
        }
    }

    getCachedData(sport, type) {
        try {
            const cacheKey = `blaze_sports_${sport}_${type}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                const parsedCache = JSON.parse(cached);

                // Check if cache is not too old (5 minutes)
                if (Date.now() - parsedCache.timestamp < 300000) {
                    return parsedCache.data;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to retrieve cached data:', error);
        }

        return null;
    }

    // ============================================================================
    // EVENT SYSTEM
    // ============================================================================

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // ============================================================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================================================

    subscribe(subscriptions) {
        this.send({
            type: 'subscribe',
            subscriptions: Array.isArray(subscriptions) ? subscriptions : [subscriptions]
        });
    }

    unsubscribe(subscriptions) {
        this.send({
            type: 'unsubscribe',
            subscriptions: Array.isArray(subscriptions) ? subscriptions : [subscriptions]
        });
    }

    // Subscribe to specific sports data
    subscribeSports(sports) {
        this.subscribe({
            type: 'sports',
            sports: Array.isArray(sports) ? sports : [sports]
        });
    }

    // Subscribe to specific teams
    subscribeTeams(teams) {
        this.subscribe({
            type: 'teams',
            teams: Array.isArray(teams) ? teams : [teams]
        });
    }

    // Subscribe to real-time game updates
    subscribeGameUpdates(gameId) {
        this.subscribe({
            type: 'game_updates',
            gameId
        });
    }

    // ============================================================================
    // CLEANUP & DESTRUCTION
    // ============================================================================

    destroy() {
        console.log('🔄 Destroying WebSocket Manager...');

        // Stop heartbeat
        this.stopHeartbeat();

        // Close connection
        if (this.connection) {
            this.connection.close(1000, 'Client shutting down');
        }

        // Clear queues and listeners
        this.messageQueue = [];
        this.eventListeners.clear();

        // Reset state
        this.isConnected = false;
        this.connection = null;

        console.log('✅ WebSocket Manager destroyed');
    }

    // ============================================================================
    // BINARY MESSAGE SUPPORT (Future Enhancement)
    // ============================================================================

    decodeBinaryMessage(arrayBuffer) {
        // Placeholder for binary message decoding
        // Future implementation for high-frequency trading-like sports data
        const view = new DataView(arrayBuffer);

        // Simple example: timestamp (8 bytes) + type (1 byte) + data
        const timestamp = view.getBigUint64(0);
        const type = view.getUint8(8);

        return {
            type: 'binary_data',
            timestamp: Number(timestamp),
            binaryType: type,
            rawData: arrayBuffer
        };
    }
}

// Export for module usage
export default WebSocketManager;

// Also make available globally for legacy compatibility
if (typeof window !== 'undefined') {
    window.WebSocketManager = WebSocketManager;
}

console.log('🔗 Blaze Sports WebSocket Manager loaded - Real-time data integration ready');