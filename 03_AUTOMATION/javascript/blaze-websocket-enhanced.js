/**
 * Blaze Intelligence Enhanced WebSocket System
 * Real-time communication for sports data, Vision AI, and coaching
 */

import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'websocket.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class BlazeWebSocketServer {
  constructor(server, config = {}) {
    this.config = {
      cors: {
        origin: config.allowedOrigins || ["http://localhost:3000", "https://blaze-intelligence.com"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6,
      ...config
    };

    // Initialize Socket.IO server
    this.io = new Server(server, this.config);
    
    // Redis for pub/sub and session management
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Connection management
    this.connections = new Map();
    this.rooms = new Map();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      messagesPerSecond: 0,
      lastMessageCount: 0,
      roomCounts: {}
    };
    
    this.initialize();
  }

  initialize() {
    logger.info('🚀 Initializing Blaze WebSocket Server...');
    
    // Set up Redis pub/sub
    this.setupRedisSubscriptions();
    
    // Set up Socket.IO event handlers
    this.setupSocketHandlers();
    
    // Set up periodic tasks
    this.setupPeriodicTasks();
    
    logger.info('✅ WebSocket Server initialized successfully');
  }

  setupRedisSubscriptions() {
    // Subscribe to various data streams
    const channels = [
      'live_games',
      'player_updates',
      'injury_reports',
      'vision_ai_analysis',
      'coaching_alerts',
      'team_notifications',
      'breaking_news'
    ];

    channels.forEach(channel => {
      this.subscriber.subscribe(channel);
    });

    this.subscriber.on('message', (channel, data) => {
      this.handleRedisMessage(channel, data);
    });
  }

  handleRedisMessage(channel, data) {
    try {
      const parsed = JSON.parse(data);
      
      switch (channel) {
        case 'live_games':
          this.broadcastToRoom('games', 'game_update', parsed);
          break;
        case 'player_updates':
          this.broadcastToRoom(`player_${parsed.playerId}`, 'player_update', parsed);
          break;
        case 'vision_ai_analysis':
          this.broadcastToRoom('vision_ai', 'analysis_update', parsed);
          break;
        case 'coaching_alerts':
          this.broadcastToRoom('coaches', 'coaching_alert', parsed);
          break;
        default:
          this.io.emit(channel, parsed);
      }
    } catch (error) {
      logger.error(`Error parsing Redis message for ${channel}:`, error);
    }
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const connectionInfo = {
      id: socket.id,
      connectedAt: Date.now(),
      user: null,
      subscriptions: new Set(),
      rooms: new Set(),
      lastActivity: Date.now(),
      messageCount: 0
    };

    this.connections.set(socket.id, connectionInfo);
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    logger.info(`New connection: ${socket.id}`);

    // Authentication handler
    socket.on('authenticate', (data) => {
      this.handleAuthentication(socket, data);
    });

    // Subscription management
    socket.on('subscribe', (data) => {
      this.handleSubscription(socket, data);
    });

    socket.on('unsubscribe', (data) => {
      this.handleUnsubscription(socket, data);
    });

    // Live game tracking
    socket.on('track_game', (data) => {
      this.handleGameTracking(socket, data);
    });

    // Player following
    socket.on('follow_player', (data) => {
      this.handlePlayerFollow(socket, data);
    });

    // Team notifications
    socket.on('follow_team', (data) => {
      this.handleTeamFollow(socket, data);
    });

    // Vision AI session
    socket.on('start_vision_session', (data) => {
      this.handleVisionSession(socket, data);
    });

    socket.on('vision_frame', (data) => {
      this.handleVisionFrame(socket, data);
    });

    // Coaching features
    socket.on('join_coaching_session', (data) => {
      this.handleCoachingSession(socket, data);
    });

    socket.on('coaching_message', (data) => {
      this.handleCoachingMessage(socket, data);
    });

    // Real-time chat/collaboration
    socket.on('chat_message', (data) => {
      this.handleChatMessage(socket, data);
    });

    // Custom queries
    socket.on('query_stats', (data) => {
      this.handleStatsQuery(socket, data);
    });

    socket.on('query_prediction', (data) => {
      this.handlePredictionQuery(socket, data);
    });

    // Connection management
    socket.on('ping', () => {
      this.updateActivity(socket.id);
      socket.emit('pong');
    });

    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });

    // Initial connection response
    socket.emit('connected', {
      socketId: socket.id,
      timestamp: Date.now(),
      availableChannels: this.getAvailableChannels()
    });
  }

  async handleAuthentication(socket, data) {
    try {
      // Verify authentication token
      const user = await this.verifyAuthToken(data.token);
      
      if (user) {
        const conn = this.connections.get(socket.id);
        conn.user = user;
        
        // Join user to their personal room
        socket.join(`user_${user.id}`);
        conn.rooms.add(`user_${user.id}`);
        
        // Join based on user role
        if (user.role === 'coach') {
          socket.join('coaches');
          conn.rooms.add('coaches');
        } else if (user.role === 'athlete') {
          socket.join('athletes');
          conn.rooms.add('athletes');
        } else if (user.role === 'admin') {
          socket.join('admins');
          conn.rooms.add('admins');
        }
        
        // Load user preferences
        const preferences = await this.loadUserPreferences(user.id);
        
        socket.emit('authenticated', {
          user: user,
          preferences: preferences,
          joinedRooms: Array.from(conn.rooms)
        });
        
        logger.info(`User authenticated: ${user.id} (${socket.id})`);
      } else {
        socket.emit('auth_failed', { message: 'Invalid authentication token' });
      }
    } catch (error) {
      logger.error(`Authentication error for ${socket.id}:`, error);
      socket.emit('auth_failed', { message: 'Authentication error' });
    }
  }

  async handleSubscription(socket, data) {
    const conn = this.connections.get(socket.id);
    if (!conn) return;

    const { channel, parameters } = data;
    
    try {
      // Validate subscription permissions
      if (await this.canSubscribeToChannel(conn.user, channel)) {
        const subscriptionKey = this.createSubscriptionKey(channel, parameters);
        
        socket.join(subscriptionKey);
        conn.subscriptions.add(subscriptionKey);
        conn.rooms.add(subscriptionKey);
        
        // Send initial data if available
        const initialData = await this.getInitialChannelData(channel, parameters);
        if (initialData) {
          socket.emit('channel_data', {
            channel,
            data: initialData,
            timestamp: Date.now()
          });
        }
        
        socket.emit('subscribed', { channel, subscriptionKey });
        logger.info(`${socket.id} subscribed to ${subscriptionKey}`);
      } else {
        socket.emit('subscription_denied', { channel, reason: 'Insufficient permissions' });
      }
    } catch (error) {
      logger.error(`Subscription error for ${socket.id}:`, error);
      socket.emit('subscription_error', { channel, error: error.message });
    }
  }

  handleUnsubscription(socket, data) {
    const conn = this.connections.get(socket.id);
    if (!conn) return;

    const { channel, parameters } = data;
    const subscriptionKey = this.createSubscriptionKey(channel, parameters);
    
    socket.leave(subscriptionKey);
    conn.subscriptions.delete(subscriptionKey);
    conn.rooms.delete(subscriptionKey);
    
    socket.emit('unsubscribed', { channel, subscriptionKey });
    logger.info(`${socket.id} unsubscribed from ${subscriptionKey}`);
  }

  handleGameTracking(socket, data) {
    const { gameId, sport } = data;
    const gameRoom = `game_${sport}_${gameId}`;
    
    socket.join(gameRoom);
    
    const conn = this.connections.get(socket.id);
    if (conn) {
      conn.rooms.add(gameRoom);
    }
    
    // Send current game state
    this.sendGameState(socket, gameId, sport);
    
    socket.emit('game_tracking_started', { gameId, sport, room: gameRoom });
  }

  handlePlayerFollow(socket, data) {
    const { playerId, sport } = data;
    const playerRoom = `player_${sport}_${playerId}`;
    
    socket.join(playerRoom);
    
    const conn = this.connections.get(socket.id);
    if (conn) {
      conn.rooms.add(playerRoom);
    }
    
    // Send current player stats
    this.sendPlayerStats(socket, playerId, sport);
    
    socket.emit('player_follow_started', { playerId, sport, room: playerRoom });
  }

  handleTeamFollow(socket, data) {
    const { teamId, sport } = data;
    const teamRoom = `team_${sport}_${teamId}`;
    
    socket.join(teamRoom);
    
    const conn = this.connections.get(socket.id);
    if (conn) {
      conn.rooms.add(teamRoom);
    }
    
    // Send team updates
    this.sendTeamUpdates(socket, teamId, sport);
    
    socket.emit('team_follow_started', { teamId, sport, room: teamRoom });
  }

  async handleVisionSession(socket, data) {
    const { sessionId, type, configuration } = data;
    
    const visionRoom = `vision_${sessionId}`;
    socket.join(visionRoom);
    
    const conn = this.connections.get(socket.id);
    if (conn) {
      conn.rooms.add(visionRoom);
      
      // Store vision session info
      conn.visionSession = {
        sessionId,
        type,
        configuration,
        startedAt: Date.now()
      };
    }
    
    socket.emit('vision_session_started', {
      sessionId,
      room: visionRoom,
      configuration
    });
    
    logger.info(`Vision session started: ${sessionId} (${socket.id})`);
  }

  async handleVisionFrame(socket, data) {
    const conn = this.connections.get(socket.id);
    if (!conn || !conn.visionSession) return;
    
    const { frame, metadata } = data;
    
    try {
      // Process frame through Vision AI
      const analysis = await this.processVisionFrame(frame, metadata, conn.visionSession);
      
      // Send results back to client
      socket.emit('vision_analysis', {
        sessionId: conn.visionSession.sessionId,
        frameId: metadata.frameId,
        analysis,
        timestamp: Date.now()
      });
      
      // Broadcast to room if configured for real-time sharing
      if (conn.visionSession.configuration.shareRealTime) {
        const visionRoom = `vision_${conn.visionSession.sessionId}`;
        socket.to(visionRoom).emit('shared_analysis', {
          frameId: metadata.frameId,
          analysis,
          from: conn.user?.id
        });
      }
    } catch (error) {
      logger.error(`Vision frame processing error:`, error);
      socket.emit('vision_error', {
        frameId: metadata.frameId,
        error: error.message
      });
    }
  }

  handleCoachingSession(socket, data) {
    const { sessionId, role } = data;
    const coachingRoom = `coaching_${sessionId}`;
    
    socket.join(coachingRoom);
    
    const conn = this.connections.get(socket.id);
    if (conn) {
      conn.rooms.add(coachingRoom);
      conn.coachingRole = role;
    }
    
    // Notify other participants
    socket.to(coachingRoom).emit('participant_joined', {
      userId: conn.user?.id,
      role,
      timestamp: Date.now()
    });
    
    socket.emit('coaching_session_joined', {
      sessionId,
      room: coachingRoom,
      role
    });
  }

  handleCoachingMessage(socket, data) {
    const { sessionId, message, type } = data;
    const coachingRoom = `coaching_${sessionId}`;
    
    const conn = this.connections.get(socket.id);
    
    const messageData = {
      id: this.generateMessageId(),
      sessionId,
      from: conn.user?.id,
      type,
      message,
      timestamp: Date.now()
    };
    
    // Broadcast to coaching session
    this.io.to(coachingRoom).emit('coaching_message', messageData);
    
    // Store message for session history
    this.storeCoachingMessage(messageData);
  }

  handleChatMessage(socket, data) {
    const { room, message, type } = data;
    
    const conn = this.connections.get(socket.id);
    if (!conn.rooms.has(room)) {
      socket.emit('chat_error', { message: 'Not authorized for this room' });
      return;
    }
    
    const chatMessage = {
      id: this.generateMessageId(),
      room,
      from: conn.user?.id,
      type: type || 'text',
      message,
      timestamp: Date.now()
    };
    
    // Broadcast to room
    this.io.to(room).emit('chat_message', chatMessage);
    
    // Store message
    this.storeChatMessage(chatMessage);
  }

  async handleStatsQuery(socket, data) {
    try {
      const { sport, playerId, teamId, statType, timeframe } = data;
      
      // Query stats from data pipeline
      const stats = await this.queryStats(sport, {
        playerId,
        teamId,
        statType,
        timeframe
      });
      
      socket.emit('stats_result', {
        queryId: data.queryId,
        stats,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Stats query error:', error);
      socket.emit('stats_error', {
        queryId: data.queryId,
        error: error.message
      });
    }
  }

  async handlePredictionQuery(socket, data) {
    try {
      const { sport, gameId, type } = data;
      
      // Get prediction from analytics engine
      const prediction = await this.getPrediction(sport, gameId, type);
      
      socket.emit('prediction_result', {
        queryId: data.queryId,
        prediction,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Prediction query error:', error);
      socket.emit('prediction_error', {
        queryId: data.queryId,
        error: error.message
      });
    }
  }

  handleDisconnection(socket, reason) {
    const conn = this.connections.get(socket.id);
    
    if (conn) {
      // Clean up rooms
      conn.rooms.forEach(room => {
        socket.leave(room);
      });
      
      // Update metrics
      this.metrics.activeConnections--;
      
      // Log disconnection
      logger.info(`Disconnection: ${socket.id} (${reason})`);
      
      // Store connection stats
      const sessionDuration = Date.now() - conn.connectedAt;
      this.storeSessionStats(socket.id, {
        duration: sessionDuration,
        messageCount: conn.messageCount,
        reason
      });
      
      // Remove from connections
      this.connections.delete(socket.id);
    }
  }

  // Utility methods
  createSubscriptionKey(channel, parameters = {}) {
    const paramString = Object.keys(parameters)
      .sort()
      .map(key => `${key}:${parameters[key]}`)
      .join(',');
    
    return paramString ? `${channel}:${paramString}` : channel;
  }

  updateActivity(socketId) {
    const conn = this.connections.get(socketId);
    if (conn) {
      conn.lastActivity = Date.now();
      conn.messageCount++;
    }
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Authentication and authorization
  async verifyAuthToken(token) {
    try {
      // Implement JWT verification or API call
      // Return user object or null
      return { id: 'user123', name: 'Test User', role: 'athlete' };
    } catch (error) {
      logger.error('Token verification error:', error);
      return null;
    }
  }

  async loadUserPreferences(userId) {
    // Load user preferences from database
    return {
      notifications: true,
      realTimeUpdates: true,
      preferredSports: ['mlb', 'nfl']
    };
  }

  async canSubscribeToChannel(user, channel) {
    // Implement permission checking logic
    if (!user) return false;
    
    // Basic permission logic
    const publicChannels = ['live_games', 'breaking_news'];
    const coachChannels = ['coaching_alerts', 'vision_ai'];
    const adminChannels = ['admin_notifications'];
    
    if (publicChannels.includes(channel)) return true;
    if (coachChannels.includes(channel) && ['coach', 'admin'].includes(user.role)) return true;
    if (adminChannels.includes(channel) && user.role === 'admin') return true;
    
    return false;
  }

  async getInitialChannelData(channel, parameters) {
    // Return initial data for newly subscribed channels
    switch (channel) {
      case 'live_games':
        return await this.getLiveGames(parameters?.sport);
      case 'player_updates':
        return await this.getPlayerData(parameters?.playerId);
      default:
        return null;
    }
  }

  getAvailableChannels() {
    return [
      'live_games',
      'player_updates',
      'team_notifications',
      'vision_ai_analysis',
      'coaching_alerts',
      'breaking_news'
    ];
  }

  // Data fetching methods
  async getLiveGames(sport) {
    // Fetch live games from Redis cache
    const key = sport ? `live_games:${sport}` : 'live_games:all';
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : [];
  }

  async getPlayerData(playerId) {
    const data = await this.redis.get(`player:${playerId}`);
    return data ? JSON.parse(data) : null;
  }

  async sendGameState(socket, gameId, sport) {
    const gameData = await this.redis.get(`game:${sport}:${gameId}`);
    if (gameData) {
      socket.emit('game_state', JSON.parse(gameData));
    }
  }

  async sendPlayerStats(socket, playerId, sport) {
    const playerData = await this.redis.get(`player:${sport}:${playerId}`);
    if (playerData) {
      socket.emit('player_stats', JSON.parse(playerData));
    }
  }

  async sendTeamUpdates(socket, teamId, sport) {
    const teamData = await this.redis.get(`team:${sport}:${teamId}`);
    if (teamData) {
      socket.emit('team_updates', JSON.parse(teamData));
    }
  }

  // Vision AI processing
  async processVisionFrame(frame, metadata, session) {
    // This would integrate with the Vision AI system
    // For now, return mock analysis
    return {
      biomechanics: {
        posture: 0.85,
        balance: 0.78,
        efficiency: 0.82
      },
      microExpressions: {
        focus: 0.73,
        determination: 0.88,
        confidence: 0.81
      },
      characterTraits: {
        mental_toughness: 0.79,
        coachability: 0.86,
        competitiveness: 0.91
      },
      recommendations: [
        'Improve hip alignment for better balance',
        'Maintain current mental focus level'
      ]
    };
  }

  // Data querying
  async queryStats(sport, params) {
    // Query stats from data pipeline
    const key = `stats:${sport}:${params.playerId || params.teamId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getPrediction(sport, gameId, type) {
    // Get prediction from analytics engine
    const key = `prediction:${sport}:${gameId}:${type}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Message storage
  async storeCoachingMessage(message) {
    const key = `coaching_messages:${message.sessionId}`;
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.expire(key, 86400); // 24 hours
  }

  async storeChatMessage(message) {
    const key = `chat_messages:${message.room}`;
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.expire(key, 86400); // 24 hours
  }

  async storeSessionStats(socketId, stats) {
    const key = `session_stats:${Date.now()}`;
    await this.redis.setex(key, 604800, JSON.stringify({ // 7 days
      socketId,
      ...stats
    }));
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Periodic tasks
  setupPeriodicTasks() {
    // Update metrics every 10 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 10000);
    
    // Clean up inactive connections every minute
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000);
    
    // Room statistics every 5 minutes
    setInterval(() => {
      this.updateRoomStatistics();
    }, 300000);
  }

  updateMetrics() {
    const currentMessageCount = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.messageCount, 0);
    
    this.metrics.messagesPerSecond = (currentMessageCount - this.metrics.lastMessageCount) / 10;
    this.metrics.lastMessageCount = currentMessageCount;
    
    // Store metrics in Redis
    this.redis.setex('websocket_metrics', 60, JSON.stringify(this.metrics));
  }

  cleanupInactiveConnections() {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [socketId, conn] of this.connections) {
      if (now - conn.lastActivity > inactiveThreshold) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
  }

  updateRoomStatistics() {
    const roomStats = {};
    
    for (const [roomName] of this.io.sockets.adapter.rooms) {
      const room = this.io.sockets.adapter.rooms.get(roomName);
      if (room && !roomName.startsWith('/')) { // Exclude namespace rooms
        roomStats[roomName] = room.size;
      }
    }
    
    this.metrics.roomCounts = roomStats;
    
    // Store room statistics
    this.redis.setex('room_statistics', 300, JSON.stringify(roomStats));
  }

  // Admin methods
  getConnectionStats() {
    return {
      total: this.metrics.totalConnections,
      active: this.metrics.activeConnections,
      messagesPerSecond: this.metrics.messagesPerSecond,
      rooms: this.metrics.roomCounts
    };
  }

  async getDetailedStats() {
    const stats = {
      connections: this.getConnectionStats(),
      rooms: Array.from(this.io.sockets.adapter.rooms.keys())
        .filter(room => !room.startsWith('/'))
        .map(room => ({
          name: room,
          size: this.io.sockets.adapter.rooms.get(room)?.size || 0
        })),
      users: Array.from(this.connections.values())
        .filter(conn => conn.user)
        .map(conn => ({
          socketId: conn.id,
          userId: conn.user.id,
          connectedAt: conn.connectedAt,
          messageCount: conn.messageCount,
          rooms: Array.from(conn.rooms)
        }))
    };
    
    return stats;
  }

  // Broadcasting methods
  broadcastSystemMessage(message, priority = 'normal') {
    this.io.emit('system_message', {
      message,
      priority,
      timestamp: Date.now()
    });
  }

  broadcastToUserRole(role, event, data) {
    this.io.to(role + 's').emit(event, data);
  }

  broadcastToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Health check
  getHealthStatus() {
    return {
      status: 'healthy',
      connections: this.metrics.activeConnections,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      redisConnected: this.redis.status === 'ready'
    };
  }
}

// Client-side helper class
export class BlazeWebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      ...options
    };
    
    this.socket = null;
    this.authenticated = false;
    this.subscriptions = new Set();
    this.callbacks = new Map();
  }

  connect() {
    if (this.socket) {
      this.socket.connect();
      return;
    }

    // Import socket.io-client dynamically for browser compatibility
    import('socket.io-client').then(({ io }) => {
      this.socket = io(this.url, this.options);
      this.setupEventHandlers();
    });
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to Blaze WebSocket server');
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.authenticated = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('authenticated', (data) => {
      this.authenticated = true;
      this.emit('authenticated', data);
    });

    this.socket.on('auth_failed', (data) => {
      this.emit('auth_failed', data);
    });

    // Set up data event handlers
    const dataEvents = [
      'game_update',
      'player_update',
      'team_update',
      'vision_analysis',
      'coaching_message',
      'chat_message',
      'stats_result',
      'prediction_result'
    ];

    dataEvents.forEach(event => {
      this.socket.on(event, (data) => {
        this.emit(event, data);
      });
    });
  }

  authenticate(token) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('authenticate', { token });
    }
  }

  subscribe(channel, parameters = {}) {
    if (this.socket && this.authenticated) {
      this.socket.emit('subscribe', { channel, parameters });
      this.subscriptions.add(channel);
    }
  }

  unsubscribe(channel, parameters = {}) {
    if (this.socket && this.authenticated) {
      this.socket.emit('unsubscribe', { channel, parameters });
      this.subscriptions.delete(channel);
    }
  }

  trackGame(gameId, sport) {
    if (this.socket && this.authenticated) {
      this.socket.emit('track_game', { gameId, sport });
    }
  }

  followPlayer(playerId, sport) {
    if (this.socket && this.authenticated) {
      this.socket.emit('follow_player', { playerId, sport });
    }
  }

  followTeam(teamId, sport) {
    if (this.socket && this.authenticated) {
      this.socket.emit('follow_team', { teamId, sport });
    }
  }

  startVisionSession(sessionId, type, configuration) {
    if (this.socket && this.authenticated) {
      this.socket.emit('start_vision_session', { sessionId, type, configuration });
    }
  }

  sendVisionFrame(frame, metadata) {
    if (this.socket && this.authenticated) {
      this.socket.emit('vision_frame', { frame, metadata });
    }
  }

  joinCoachingSession(sessionId, role) {
    if (this.socket && this.authenticated) {
      this.socket.emit('join_coaching_session', { sessionId, role });
    }
  }

  sendCoachingMessage(sessionId, message, type = 'text') {
    if (this.socket && this.authenticated) {
      this.socket.emit('coaching_message', { sessionId, message, type });
    }
  }

  queryStats(sport, options) {
    if (this.socket && this.authenticated) {
      const queryId = `query_${Date.now()}`;
      this.socket.emit('query_stats', { queryId, sport, ...options });
      return queryId;
    }
  }

  queryPrediction(sport, gameId, type) {
    if (this.socket && this.authenticated) {
      const queryId = `query_${Date.now()}`;
      this.socket.emit('query_prediction', { queryId, sport, gameId, type });
      return queryId;
    }
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default BlazeWebSocketServer;