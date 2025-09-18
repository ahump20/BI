/**
 * Blaze Intelligence WebSocket Client
 * Client-side WebSocket connection and real-time data handling
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Team-specific stream subscriptions
 * - Real-time biometric data visualization
 * - Visual overlay integration
 * - Performance monitoring and metrics
 * - Champion Enigma Engine integration
 */

class BlazeWebSocketClient {
  constructor(config = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080',
      authToken: config.authToken || null,
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      heartbeatInterval: config.heartbeatInterval || 30000,
      ...config
    };

    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.subscriptions = new Set();
    this.messageHandlers = new Map();
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      connectionTime: null,
      lastActivity: null
    };

    this.eventListeners = new Map();
    this.heartbeatTimer = null;
    
    // Bind methods
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);

    // Initialize default handlers
    this.setupDefaultHandlers();
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔗 Already connected to WebSocket server');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        console.log(`🔗 Connecting to ${this.config.url}...`);
        
        this.ws = new WebSocket(this.config.url, [], {
          headers: this.config.authToken ? {
            'Authorization': `Bearer ${this.config.authToken}`
          } : {}
        });

        this.ws.addEventListener('open', (event) => {
          this.onOpen(event);
          resolve();
        });

        this.ws.addEventListener('message', this.onMessage);
        this.ws.addEventListener('close', this.onClose);
        this.ws.addEventListener('error', (event) => {
          this.onError(event);
          reject(event);
        });

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    console.log('🔌 Disconnected from WebSocket server');
  }

  onOpen(event) {
    console.log('✅ Connected to Blaze WebSocket server');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.metrics.connectionTime = Date.now();
    this.metrics.lastActivity = Date.now();

    // Start heartbeat
    this.startHeartbeat();

    // Emit connection event
    this.emit('connected', { timestamp: Date.now() });

    // Resubscribe to previous subscriptions if reconnecting
    if (this.subscriptions.size > 0) {
      this.subscriptions.forEach(subscription => {
        const [team, channels] = subscription.split(':');
        this.subscribe(team, channels.split(','));
      });
    }
  }

  onMessage(event) {
    this.metrics.messagesReceived++;
    this.metrics.bytesReceived += event.data.length;
    this.metrics.lastActivity = Date.now();

    try {
      const message = JSON.parse(event.data);
      console.log('📨 Received message:', message.type);

      // Handle message based on type
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      } else {
        this.handleDefaultMessage(message);
      }

      // Emit message event
      this.emit('message', message);

    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  onClose(event) {
    console.log('🔌 WebSocket connection closed:', event.code, event.reason);
    this.isConnected = false;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Attempt reconnection if not intentional
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnection();
    }
  }

  onError(event) {
    console.error('❌ WebSocket error:', event);
    this.emit('error', event);
  }

  attemptReconnection() {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error);
          if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.emit('reconnectionFailed');
          }
        });
      }
    }, delay);
  }

  send(message) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);
      this.metrics.messagesSent++;
      this.metrics.bytesSent += messageStr.length;
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return false;
    }
  }

  subscribe(team, channels) {
    const subscription = `${team}:${channels.join(',')}`;
    this.subscriptions.add(subscription);

    return this.send({
      type: 'subscribe',
      team,
      channels,
      timestamp: Date.now()
    });
  }

  unsubscribe(team, channels) {
    const subscription = `${team}:${channels.join(',')}`;
    this.subscriptions.delete(subscription);

    return this.send({
      type: 'unsubscribe',
      team,
      channels,
      timestamp: Date.now()
    });
  }

  sendBiometricData(team, playerId, biometrics) {
    return this.send({
      type: 'biometric_data',
      team,
      playerId,
      biometrics,
      timestamp: Date.now()
    });
  }

  requestAnalysis(team, playerId, analysisType) {
    return this.send({
      type: 'analysis_request',
      team,
      playerId,
      analysisType,
      timestamp: Date.now()
    });
  }

  updateOverlayConfig(team, overlaySettings) {
    return this.send({
      type: 'overlay_config',
      team,
      overlaySettings,
      timestamp: Date.now()
    });
  }

  controlStream(team, action, config = {}) {
    return this.send({
      type: 'stream_control',
      team,
      action,
      config,
      timestamp: Date.now()
    });
  }

  setupDefaultHandlers() {
    // Connection confirmation handler
    this.messageHandlers.set('connection', (message) => {
      console.log('✅ Connection confirmed:', message);
      this.emit('connectionConfirmed', message);
    });

    // Subscription confirmation handler
    this.messageHandlers.set('subscription_confirmed', (message) => {
      console.log(`✅ Subscribed to ${message.team}: ${message.channels.join(', ')}`);
      this.emit('subscriptionConfirmed', message);
    });

    // Live update handler
    this.messageHandlers.set('live_update', (message) => {
      console.log('🔴 Live update received:', message.team, message.updateType);
      this.emit('liveUpdate', message);
    });

    // Biometric update handler
    this.messageHandlers.set('biometric_update', (message) => {
      console.log('💓 Biometric update:', message.playerId);
      this.emit('biometricUpdate', message);
    });

    // Analysis result handler
    this.messageHandlers.set('analysis_result', (message) => {
      console.log('🧠 Analysis result:', message.analysisType);
      this.emit('analysisResult', message);
    });

    // Overlay update handler
    this.messageHandlers.set('overlay_update', (message) => {
      console.log('🎨 Overlay update:', message.team);
      this.emit('overlayUpdate', message);
    });

    // Initial data handler
    this.messageHandlers.set('initial_data', (message) => {
      console.log('📊 Initial data received:', message.team, message.channel);
      this.emit('initialData', message);
    });

    // Error handler
    this.messageHandlers.set('error', (message) => {
      console.error('❌ Server error:', message.message);
      this.emit('serverError', message);
    });
  }

  handleDefaultMessage(message) {
    console.log('📨 Unhandled message type:', message.type, message);
    this.emit('unhandledMessage', message);
  }

  addMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  removeMessageHandler(type) {
    this.messageHandlers.delete(type);
  }

  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send ping (browser WebSocket will handle pong automatically)
        this.ws.ping && this.ws.ping();
        
        // Check for stale connection
        const now = Date.now();
        if (now - this.metrics.lastActivity > this.config.heartbeatInterval * 2) {
          console.warn('⚠️ Connection appears stale, attempting reconnection');
          this.ws.close();
        }
      }
    }, this.config.heartbeatInterval);
  }

  // Event system
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  getMetrics() {
    return {
      ...this.metrics,
      isConnected: this.isConnected,
      subscriptions: Array.from(this.subscriptions),
      uptime: this.metrics.connectionTime ? Date.now() - this.metrics.connectionTime : 0
    };
  }

  getConnectionState() {
    return {
      connected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: this.subscriptions.size
    };
  }
}

// Team-specific WebSocket clients
class TeamWebSocketClient extends BlazeWebSocketClient {
  constructor(team, config = {}) {
    super(config);
    this.team = team;
    this.teamConfig = this.getTeamConfig(team);
    this.overlaySystem = null;
    this.dataBuffer = new Map();
    
    // Team-specific event handlers
    this.setupTeamHandlers();
  }

  getTeamConfig(team) {
    const configs = {
      CARDINALS: {
        id: 'STL',
        name: 'St. Louis Cardinals',
        sport: 'MLB',
        colors: { primary: '#C41E3A', secondary: '#FEDB00' }
      },
      TITANS: {
        id: 'TEN',
        name: 'Tennessee Titans',
        sport: 'NFL',
        colors: { primary: '#0C2340', secondary: '#4B92DB' }
      },
      LONGHORNS: {
        id: 'TEX',
        name: 'Texas Longhorns',
        sport: 'NCAA',
        colors: { primary: '#BF5700', secondary: '#FFFFFF' }
      },
      GRIZZLIES: {
        id: 'MEM',
        name: 'Memphis Grizzlies',
        sport: 'NBA',
        colors: { primary: '#5D76A9', secondary: '#12173F' }
      }
    };

    return configs[team] || configs.CARDINALS;
  }

  setupTeamHandlers() {
    // Handle team-specific live updates
    this.on('liveUpdate', (message) => {
      if (message.team === this.team) {
        this.handleTeamLiveUpdate(message);
      }
    });

    // Handle biometric updates
    this.on('biometricUpdate', (message) => {
      if (message.team === this.team) {
        this.handleTeamBiometrics(message);
      }
    });

    // Handle analysis results
    this.on('analysisResult', (message) => {
      if (message.team === this.team) {
        this.handleTeamAnalysis(message);
      }
    });
  }

  async connectAndSubscribe(channels = ['live-game', 'player-stats', 'biometrics', 'analysis']) {
    try {
      await this.connect();
      this.subscribe(this.team, channels);
      console.log(`🏈 ${this.teamConfig.name} WebSocket client connected and subscribed`);
    } catch (error) {
      console.error(`❌ Failed to connect ${this.teamConfig.name} client:`, error);
      throw error;
    }
  }

  handleTeamLiveUpdate(message) {
    const { updateType, data } = message;
    
    // Update data buffer
    this.dataBuffer.set(`live-${updateType}`, {
      data,
      timestamp: message.timestamp
    });

    // Emit team-specific events
    this.emit('teamLiveUpdate', {
      team: this.teamConfig,
      updateType,
      data
    });

    // Update overlays if available
    if (this.overlaySystem) {
      this.updateOverlaysFromLiveData(updateType, data);
    }
  }

  handleTeamBiometrics(message) {
    const { playerId, data, analysis } = message;
    
    // Store biometric data
    this.dataBuffer.set(`biometrics-${playerId}`, {
      data,
      analysis,
      timestamp: message.timestamp
    });

    // Emit team-specific event
    this.emit('teamBiometrics', {
      team: this.teamConfig,
      playerId,
      data,
      analysis
    });

    // Update biometric overlays
    if (this.overlaySystem) {
      this.updateBiometricOverlay(playerId, data, analysis);
    }
  }

  handleTeamAnalysis(message) {
    const { playerId, analysisType, result } = message;
    
    // Store analysis result
    this.dataBuffer.set(`analysis-${playerId}-${analysisType}`, {
      result,
      timestamp: message.timestamp
    });

    // Emit team-specific event
    this.emit('teamAnalysis', {
      team: this.teamConfig,
      playerId,
      analysisType,
      result
    });

    // Update analysis overlays
    if (this.overlaySystem) {
      this.updateAnalysisOverlay(playerId, analysisType, result);
    }
  }

  setOverlaySystem(overlaySystem) {
    this.overlaySystem = overlaySystem;
    console.log(`🎨 Overlay system connected to ${this.teamConfig.name} WebSocket client`);
  }

  updateOverlaysFromLiveData(updateType, data) {
    if (!this.overlaySystem) return;

    switch (updateType) {
      case 'score':
        this.overlaySystem.updateOverlay('team-comparison', data);
        break;
      case 'player-stats':
        data.players?.forEach(player => {
          this.overlaySystem.updateOverlay(`player-stats-${player.id}`, player);
        });
        break;
      case 'game-state':
        this.overlaySystem.updateOverlay('live-metrics', data);
        break;
    }
  }

  updateBiometricOverlay(playerId, data, analysis) {
    if (!this.overlaySystem) return;

    this.overlaySystem.updateOverlay(`biometric-${playerId}`, {
      ...data,
      analysis
    });

    // Update injury alerts if risk detected
    if (analysis.injury_risk > 0.7) {
      this.overlaySystem.addOverlay(
        `injury-alert-${playerId}`,
        'injury_alert',
        {
          playerName: `Player ${playerId}`,
          riskLevel: Math.round(analysis.injury_risk * 100),
          riskType: 'Fatigue/Overload'
        },
        { duration: 10000 }
      );
    }
  }

  updateAnalysisOverlay(playerId, analysisType, result) {
    if (!this.overlaySystem) return;

    switch (analysisType) {
      case 'champion_enigma':
        this.overlaySystem.updateOverlay(`champion-radar-${playerId}`, {
          dimensions: result.dimensions,
          championScore: result.championScore
        });
        break;
      case 'performance_prediction':
        this.overlaySystem.updateOverlay('momentum-tracker', {
          momentum: result.momentum,
          prediction: result.prediction
        });
        break;
    }
  }

  getTeamData(dataType) {
    const keys = Array.from(this.dataBuffer.keys()).filter(key => key.startsWith(dataType));
    const data = {};
    
    keys.forEach(key => {
      data[key] = this.dataBuffer.get(key);
    });
    
    return data;
  }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeWebSocketClient, TeamWebSocketClient };
} else if (typeof window !== 'undefined') {
  window.BlazeWebSocketClient = BlazeWebSocketClient;
  window.TeamWebSocketClient = TeamWebSocketClient;
}