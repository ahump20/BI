/**
 * Blaze Intelligence Mobile SDK
 * Cross-platform SDK for iOS and Android integration
 * Supports React Native, Flutter, and native development
 */

// Core SDK Class
export class BlazeMobileSDK {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.blaze-intelligence.com/v2',
      wsUrl: config.wsUrl || 'wss://ws.blaze-intelligence.com',
      enableVisionAI: config.enableVisionAI || true,
      enableRealTime: config.enableRealTime || true,
      cacheSize: config.cacheSize || 50, // MB
      logLevel: config.logLevel || 'info',
      ...config
    };

    this.apiClient = null;
    this.wsClient = null;
    this.visionProcessor = null;
    this.cache = new Map();
    this.eventListeners = new Map();
    this.sessionId = null;
    this.userId = null;
    this.isAuthenticated = false;
  }

  // Initialization
  async initialize() {
    try {
      console.log('🚀 Initializing Blaze Mobile SDK...');

      // Initialize API client
      this.apiClient = new BlazeAPIClient(this.config);
      await this.apiClient.initialize();

      // Initialize WebSocket client if enabled
      if (this.config.enableRealTime) {
        this.wsClient = new BlazeWebSocketClient(this.config);
        await this.wsClient.initialize();
        this.setupWebSocketEventHandlers();
      }

      // Initialize Vision AI processor if enabled
      if (this.config.enableVisionAI) {
        this.visionProcessor = new BlazeVisionProcessor(this.config);
        await this.visionProcessor.initialize();
      }

      // Generate session ID
      this.sessionId = this.generateSessionId();

      console.log('✅ Blaze Mobile SDK initialized successfully');
      this.emit('sdk:initialized', { sessionId: this.sessionId });

      return true;
    } catch (error) {
      console.error('Failed to initialize SDK:', error);
      this.emit('sdk:error', { error: error.message });
      throw error;
    }
  }

  // Authentication
  async authenticate(credentials) {
    try {
      const authResult = await this.apiClient.authenticate(credentials);
      
      if (authResult.success) {
        this.userId = authResult.user.id;
        this.isAuthenticated = true;
        
        // Store auth token securely
        await this.secureStorage.setItem('auth_token', authResult.token);
        
        // Authenticate WebSocket if available
        if (this.wsClient) {
          await this.wsClient.authenticate(authResult.token);
        }

        this.emit('auth:success', authResult.user);
        return authResult;
      } else {
        this.emit('auth:failed', { error: authResult.error });
        return authResult;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.emit('auth:error', { error: error.message });
      throw error;
    }
  }

  async logout() {
    try {
      await this.apiClient.logout();
      await this.secureStorage.removeItem('auth_token');
      
      this.userId = null;
      this.isAuthenticated = false;
      
      if (this.wsClient) {
        this.wsClient.disconnect();
      }

      this.emit('auth:logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Sports Data API
  async getPlayerStats(playerId, sport, options = {}) {
    const cacheKey = `player_stats_${playerId}_${sport}`;
    
    // Check cache first
    if (this.cache.has(cacheKey) && !options.forceRefresh) {
      return this.cache.get(cacheKey);
    }

    try {
      const stats = await this.apiClient.get(`/players/${playerId}/stats`, {
        sport,
        ...options
      });

      // Cache the result
      this.cache.set(cacheKey, stats);
      setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 minutes

      return stats;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }

  async getTeamStats(teamId, sport, options = {}) {
    const cacheKey = `team_stats_${teamId}_${sport}`;
    
    if (this.cache.has(cacheKey) && !options.forceRefresh) {
      return this.cache.get(cacheKey);
    }

    try {
      const stats = await this.apiClient.get(`/teams/${teamId}/stats`, {
        sport,
        ...options
      });

      this.cache.set(cacheKey, stats);
      setTimeout(() => this.cache.delete(cacheKey), 300000);

      return stats;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      throw error;
    }
  }

  async getLiveGames(sport, date = null) {
    try {
      const games = await this.apiClient.get('/games/live', {
        sport,
        date: date || new Date().toISOString().split('T')[0]
      });

      this.emit('games:loaded', { sport, games });
      return games;
    } catch (error) {
      console.error('Error fetching live games:', error);
      throw error;
    }
  }

  async getGamePredictions(gameId, sport) {
    try {
      const predictions = await this.apiClient.get(`/games/${gameId}/predictions`, {
        sport
      });

      return predictions;
    } catch (error) {
      console.error('Error fetching game predictions:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  async subscribeToGame(gameId, sport) {
    if (!this.wsClient || !this.isAuthenticated) {
      throw new Error('WebSocket client not available or not authenticated');
    }

    try {
      await this.wsClient.subscribe('live_games', { gameId, sport });
      this.emit('subscription:active', { type: 'game', gameId, sport });
    } catch (error) {
      console.error('Error subscribing to game:', error);
      throw error;
    }
  }

  async subscribeToPlayer(playerId, sport) {
    if (!this.wsClient || !this.isAuthenticated) {
      throw new Error('WebSocket client not available or not authenticated');
    }

    try {
      await this.wsClient.subscribe('player_updates', { playerId, sport });
      this.emit('subscription:active', { type: 'player', playerId, sport });
    } catch (error) {
      console.error('Error subscribing to player:', error);
      throw error;
    }
  }

  async unsubscribeFromGame(gameId, sport) {
    if (!this.wsClient) return;

    try {
      await this.wsClient.unsubscribe('live_games', { gameId, sport });
      this.emit('subscription:inactive', { type: 'game', gameId, sport });
    } catch (error) {
      console.error('Error unsubscribing from game:', error);
    }
  }

  // Vision AI functionality
  async startVisionSession(sessionConfig) {
    if (!this.visionProcessor) {
      throw new Error('Vision AI not enabled');
    }

    try {
      const session = await this.visionProcessor.startSession(sessionConfig);
      this.emit('vision:session_started', session);
      return session;
    } catch (error) {
      console.error('Error starting vision session:', error);
      throw error;
    }
  }

  async analyzeFrame(frameData, metadata = {}) {
    if (!this.visionProcessor) {
      throw new Error('Vision AI not enabled');
    }

    try {
      const analysis = await this.visionProcessor.analyzeFrame(frameData, {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        ...metadata
      });

      this.emit('vision:analysis_complete', analysis);
      return analysis;
    } catch (error) {
      console.error('Error analyzing frame:', error);
      throw error;
    }
  }

  async stopVisionSession(sessionId) {
    if (!this.visionProcessor) return;

    try {
      await this.visionProcessor.stopSession(sessionId);
      this.emit('vision:session_stopped', { sessionId });
    } catch (error) {
      console.error('Error stopping vision session:', error);
    }
  }

  // Coaching features
  async getCoachingRecommendations(analysisData, profileData) {
    try {
      const recommendations = await this.apiClient.post('/coaching/recommendations', {
        analysisData,
        profileData,
        userId: this.userId,
        sessionId: this.sessionId
      });

      this.emit('coaching:recommendations', recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error getting coaching recommendations:', error);
      throw error;
    }
  }

  async joinCoachingSession(sessionId, role = 'athlete') {
    if (!this.wsClient || !this.isAuthenticated) {
      throw new Error('WebSocket client not available or not authenticated');
    }

    try {
      await this.wsClient.joinCoachingSession(sessionId, role);
      this.emit('coaching:session_joined', { sessionId, role });
    } catch (error) {
      console.error('Error joining coaching session:', error);
      throw error;
    }
  }

  async sendCoachingMessage(sessionId, message, type = 'text') {
    if (!this.wsClient) return;

    try {
      await this.wsClient.sendCoachingMessage(sessionId, message, type);
      this.emit('coaching:message_sent', { sessionId, message, type });
    } catch (error) {
      console.error('Error sending coaching message:', error);
      throw error;
    }
  }

  // Event handling
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

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Utility methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupWebSocketEventHandlers() {
    this.wsClient.on('game_update', (data) => {
      this.emit('realtime:game_update', data);
    });

    this.wsClient.on('player_update', (data) => {
      this.emit('realtime:player_update', data);
    });

    this.wsClient.on('vision_analysis', (data) => {
      this.emit('realtime:vision_analysis', data);
    });

    this.wsClient.on('coaching_message', (data) => {
      this.emit('realtime:coaching_message', data);
    });

    this.wsClient.on('disconnected', () => {
      this.emit('realtime:disconnected');
    });

    this.wsClient.on('reconnected', () => {
      this.emit('realtime:reconnected');
    });
  }
}

// API Client Class
class BlazeAPIClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      'User-Agent': `Blaze-Mobile-SDK/1.0`
    };
  }

  async initialize() {
    // Test API connection
    try {
      await this.get('/health');
    } catch (error) {
      throw new Error(`API connection failed: ${error.message}`);
    }
  }

  async authenticate(credentials) {
    const response = await this.post('/auth/login', credentials);
    
    if (response.token) {
      this.headers['Authorization'] = `Bearer ${response.token}`;
    }

    return response;
  }

  async logout() {
    await this.post('/auth/logout');
    delete this.headers['Authorization'];
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers
    });

    return this.handleResponse(response);
  }

  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  async put(endpoint, data = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers
    });

    return this.handleResponse(response);
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }
}

// WebSocket Client Class
class BlazeWebSocketClient {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.eventListeners = new Map();
    this.subscriptions = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.pingInterval = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.connect();
        
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.config.wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startPing();
      this.emit('connected');
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.stopPing();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'pong':
        // Handle ping response
        break;
      case 'game_update':
        this.emit('game_update', data);
        break;
      case 'player_update':
        this.emit('player_update', data);
        break;
      case 'vision_analysis':
        this.emit('vision_analysis', data);
        break;
      case 'coaching_message':
        this.emit('coaching_message', data);
        break;
      default:
        this.emit(type, data);
    }
  }

  async authenticate(token) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this.send('authenticate', { token });
  }

  async subscribe(channel, parameters = {}) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const subscriptionKey = `${channel}:${JSON.stringify(parameters)}`;
    this.subscriptions.add(subscriptionKey);
    
    this.send('subscribe', { channel, parameters });
  }

  async unsubscribe(channel, parameters = {}) {
    if (!this.isConnected) return;

    const subscriptionKey = `${channel}:${JSON.stringify(parameters)}`;
    this.subscriptions.delete(subscriptionKey);
    
    this.send('unsubscribe', { channel, parameters });
  }

  async joinCoachingSession(sessionId, role) {
    this.send('join_coaching_session', { sessionId, role });
  }

  async sendCoachingMessage(sessionId, message, type) {
    this.send('coaching_message', { sessionId, message, type });
  }

  send(type, data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', {});
      }
    }, 30000); // Ping every 30 seconds
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
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

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Vision AI Processor Class
class BlazeVisionProcessor {
  constructor(config) {
    this.config = config;
    this.activeSessions = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async initialize() {
    // Initialize any required vision processing resources
    console.log('Vision AI processor initialized');
  }

  async startSession(sessionConfig) {
    const sessionId = `vision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      config: sessionConfig,
      startTime: Date.now(),
      frameCount: 0,
      analyses: []
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  async analyzeFrame(frameData, metadata) {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({
        frameData,
        metadata,
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift();
      
      try {
        const analysis = await this.processFrame(item.frameData, item.metadata);
        item.resolve(analysis);
      } catch (error) {
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  async processFrame(frameData, metadata) {
    // Simulate vision AI processing
    // In a real implementation, this would use TensorFlow.js or similar
    
    const analysis = {
      frameId: metadata.frameId || `frame_${Date.now()}`,
      timestamp: metadata.timestamp || Date.now(),
      biomechanics: {
        posture: Math.random() * 0.4 + 0.6, // 0.6-1.0
        balance: Math.random() * 0.4 + 0.6,
        efficiency: Math.random() * 0.4 + 0.6
      },
      microExpressions: {
        focus: Math.random(),
        confidence: Math.random(),
        stress: Math.random() * 0.3, // Lower stress
        fatigue: Math.random() * 0.3  // Lower fatigue
      },
      characterTraits: {
        determination: Math.random() * 0.3 + 0.7, // Higher determination
        mental_toughness: Math.random() * 0.3 + 0.7,
        coachability: Math.random() * 0.3 + 0.7
      },
      recommendations: [
        'Maintain current posture alignment',
        'Focus on breathing consistency',
        'Excellent mental focus detected'
      ]
    };

    // Store analysis in session
    if (metadata.sessionId && this.activeSessions.has(metadata.sessionId)) {
      const session = this.activeSessions.get(metadata.sessionId);
      session.frameCount++;
      session.analyses.push(analysis);
    }

    return analysis;
  }

  async stopSession(sessionId) {
    if (this.activeSessions.has(sessionId)) {
      const session = this.activeSessions.get(sessionId);
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      
      // Generate session summary
      const summary = this.generateSessionSummary(session);
      
      this.activeSessions.delete(sessionId);
      return summary;
    }
  }

  generateSessionSummary(session) {
    if (session.analyses.length === 0) {
      return { sessionId: session.id, summary: 'No analyses performed' };
    }

    const analyses = session.analyses;
    
    // Calculate averages
    const avgBiomechanics = {
      posture: analyses.reduce((sum, a) => sum + a.biomechanics.posture, 0) / analyses.length,
      balance: analyses.reduce((sum, a) => sum + a.biomechanics.balance, 0) / analyses.length,
      efficiency: analyses.reduce((sum, a) => sum + a.biomechanics.efficiency, 0) / analyses.length
    };

    const avgMicroExpressions = {
      focus: analyses.reduce((sum, a) => sum + a.microExpressions.focus, 0) / analyses.length,
      confidence: analyses.reduce((sum, a) => sum + a.microExpressions.confidence, 0) / analyses.length,
      stress: analyses.reduce((sum, a) => sum + a.microExpressions.stress, 0) / analyses.length,
      fatigue: analyses.reduce((sum, a) => sum + a.microExpressions.fatigue, 0) / analyses.length
    };

    const avgCharacterTraits = {
      determination: analyses.reduce((sum, a) => sum + a.characterTraits.determination, 0) / analyses.length,
      mental_toughness: analyses.reduce((sum, a) => sum + a.characterTraits.mental_toughness, 0) / analyses.length,
      coachability: analyses.reduce((sum, a) => sum + a.characterTraits.coachability, 0) / analyses.length
    };

    return {
      sessionId: session.id,
      duration: session.duration,
      frameCount: session.frameCount,
      averages: {
        biomechanics: avgBiomechanics,
        microExpressions: avgMicroExpressions,
        characterTraits: avgCharacterTraits
      },
      trends: this.calculateTrends(analyses),
      overallScore: this.calculateOverallScore(avgBiomechanics, avgMicroExpressions, avgCharacterTraits)
    };
  }

  calculateTrends(analyses) {
    if (analyses.length < 2) return { trend: 'insufficient_data' };

    const first = analyses[0];
    const last = analyses[analyses.length - 1];

    return {
      biomechanics: {
        posture: last.biomechanics.posture - first.biomechanics.posture,
        balance: last.biomechanics.balance - first.biomechanics.balance,
        efficiency: last.biomechanics.efficiency - first.biomechanics.efficiency
      },
      microExpressions: {
        focus: last.microExpressions.focus - first.microExpressions.focus,
        confidence: last.microExpressions.confidence - first.microExpressions.confidence,
        stress: last.microExpressions.stress - first.microExpressions.stress,
        fatigue: last.microExpressions.fatigue - first.microExpressions.fatigue
      }
    };
  }

  calculateOverallScore(biomechanics, microExpressions, characterTraits) {
    const bioScore = (biomechanics.posture + biomechanics.balance + biomechanics.efficiency) / 3;
    const mentalScore = (microExpressions.focus + microExpressions.confidence - microExpressions.stress - microExpressions.fatigue) / 2;
    const characterScore = (characterTraits.determination + characterTraits.mental_toughness + characterTraits.coachability) / 3;

    return (bioScore * 0.4 + mentalScore * 0.3 + characterScore * 0.3);
  }
}

// Secure Storage utility (platform-specific implementations would be needed)
class SecureStorage {
  constructor() {
    // This would use platform-specific secure storage
    // iOS: Keychain, Android: Encrypted SharedPreferences
    this.storage = new Map(); // Fallback to in-memory
  }

  async setItem(key, value) {
    // Platform-specific secure storage implementation
    this.storage.set(key, value);
  }

  async getItem(key) {
    return this.storage.get(key);
  }

  async removeItem(key) {
    this.storage.delete(key);
  }

  async clear() {
    this.storage.clear();
  }
}

// Export for different platforms
export default BlazeMobileSDK;

// React Native specific exports
export const BlazeReactNativeSDK = BlazeMobileSDK;

// Flutter specific exports (would need platform channels)
export const BlazeFlutterSDK = BlazeMobileSDK;

// Usage examples and documentation
export const SDKExamples = {
  initialization: `
    import { BlazeMobileSDK } from '@blaze-intelligence/mobile-sdk';
    
    const sdk = new BlazeMobileSDK({
      apiKey: 'your-api-key',
      enableVisionAI: true,
      enableRealTime: true
    });
    
    await sdk.initialize();
  `,

  authentication: `
    const authResult = await sdk.authenticate({
      email: 'athlete@example.com',
      password: 'password'
    });
    
    if (authResult.success) {
      console.log('Authenticated:', authResult.user);
    }
  `,

  liveData: `
    // Subscribe to live game updates
    await sdk.subscribeToGame('game-123', 'mlb');
    
    sdk.on('realtime:game_update', (gameData) => {
      console.log('Game update:', gameData);
    });
  `,

  visionAI: `
    // Start vision analysis session
    const session = await sdk.startVisionSession({
      sport: 'baseball',
      analysisType: 'batting',
      enableRealTime: true
    });
    
    // Analyze camera frame
    const analysis = await sdk.analyzeFrame(frameData, {
      sessionId: session.id
    });
    
    console.log('Analysis:', analysis);
  `,

  coaching: `
    // Get AI coaching recommendations
    const recommendations = await sdk.getCoachingRecommendations(
      analysisData,
      athleteProfile
    );
    
    // Join coaching session
    await sdk.joinCoachingSession('session-123', 'athlete');
    
    sdk.on('realtime:coaching_message', (message) => {
      console.log('Coach message:', message);
    });
  `
};

// Platform-specific setup instructions
export const SetupInstructions = {
  reactNative: {
    installation: 'npm install @blaze-intelligence/react-native-sdk',
    permissions: {
      ios: ['NSCameraUsageDescription', 'NSMicrophoneUsageDescription'],
      android: ['CAMERA', 'RECORD_AUDIO', 'INTERNET']
    }
  },
  flutter: {
    installation: 'flutter pub add blaze_intelligence_sdk',
    permissions: {
      ios: 'Add camera/microphone permissions to Info.plist',
      android: 'Add permissions to AndroidManifest.xml'
    }
  },
  native: {
    ios: 'CocoaPods integration available',
    android: 'Gradle dependency available'
  }
};