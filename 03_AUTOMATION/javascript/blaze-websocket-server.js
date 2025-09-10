/**
 * Blaze Visual Engine - Real-Time WebSocket Server
 * Live visual overlays and streaming updates
 */

import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

/**
 * Real-Time Visual Streaming Server
 */
class BlazeWebSocketServer {
  constructor(config) {
    this.config = config;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ 
      server: this.server,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });
    
    // Redis for pub/sub and caching
    this.redis = new Redis(config.redis.url);
    this.pubsub = new Redis(config.redis.url);
    
    // Client management
    this.clients = new Map();
    this.rooms = new Map();
    this.subscriptions = new Map();
    
    // Stream management
    this.activeStreams = new Map();
    this.streamMetrics = new Map();
    
    // Performance tracking
    this.metrics = {
      connections: 0,
      messages: 0,
      errors: 0,
      latency: []
    };
    
    this.setupMiddleware();
    this.setupWebSocket();
    this.setupRedisSubscriptions();
  }

  /**
   * Setup Express Middleware
   */
  setupMiddleware() {
    this.app.use(express.json());
    
    // CORS for WebSocket upgrade
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        clients: this.clients.size,
        streams: this.activeStreams.size,
        uptime: process.uptime()
      });
    });
    
    // Stream statistics
    this.app.get('/stats', (req, res) => {
      res.json({
        metrics: this.metrics,
        streams: Array.from(this.activeStreams.keys()),
        rooms: Array.from(this.rooms.keys()).map(room => ({
          room,
          clients: this.rooms.get(room).size
        }))
      });
    });
  }

  /**
   * Setup WebSocket Server
   */
  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const client = {
        id: clientId,
        ws,
        authenticated: false,
        athleteId: null,
        subscriptions: new Set(),
        joinedAt: Date.now(),
        lastActivity: Date.now()
      };
      
      this.clients.set(clientId, client);
      this.metrics.connections++;
      
      console.log(`Client connected: ${clientId}`);
      
      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        timestamp: Date.now(),
        capabilities: [
          'live_overlay',
          'clutch_moments',
          'evolution_tracking',
          'prediction_updates',
          'biometric_streaming'
        ]
      });
      
      // Setup client event handlers
      ws.on('message', async (message) => {
        await this.handleClientMessage(clientId, message);
      });
      
      ws.on('pong', () => {
        client.lastActivity = Date.now();
      });
      
      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });
      
      ws.on('error', (error) => {
        console.error(`Client ${clientId} error:`, error);
        this.metrics.errors++;
      });
    });
    
    // Heartbeat to detect disconnected clients
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  /**
   * Handle Client Messages
   */
  async handleClientMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    client.lastActivity = Date.now();
    this.metrics.messages++;
    
    try {
      const data = JSON.parse(message);
      const startTime = Date.now();
      
      switch (data.type) {
        case 'authenticate':
          await this.authenticateClient(clientId, data.token);
          break;
          
        case 'subscribe':
          await this.subscribeToStream(clientId, data);
          break;
          
        case 'unsubscribe':
          await this.unsubscribeFromStream(clientId, data.streamId);
          break;
          
        case 'join_room':
          await this.joinRoom(clientId, data.room);
          break;
          
        case 'leave_room':
          await this.leaveRoom(clientId, data.room);
          break;
          
        case 'start_stream':
          await this.startVisualStream(clientId, data);
          break;
          
        case 'stop_stream':
          await this.stopVisualStream(clientId, data.streamId);
          break;
          
        case 'request_overlay':
          await this.generateOverlay(clientId, data);
          break;
          
        case 'update_biometrics':
          await this.updateBiometrics(clientId, data);
          break;
          
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
          break;
          
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
      
      // Track latency
      const latency = Date.now() - startTime;
      this.metrics.latency.push(latency);
      if (this.metrics.latency.length > 1000) {
        this.metrics.latency.shift();
      }
      
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Authenticate Client
   */
  async authenticateClient(clientId, token) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret);
      client.authenticated = true;
      client.athleteId = decoded.athleteId;
      
      this.sendToClient(clientId, {
        type: 'authenticated',
        athleteId: decoded.athleteId,
        permissions: decoded.permissions || [],
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.sendToClient(clientId, {
        type: 'authentication_failed',
        message: 'Invalid token',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Subscribe to Visual Stream
   */
  async subscribeToStream(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.authenticated) {
      return this.sendToClient(clientId, {
        type: 'error',
        message: 'Authentication required',
        timestamp: Date.now()
      });
    }
    
    const { streamId, filters = {} } = data;
    
    // Add to subscription
    client.subscriptions.add(streamId);
    
    // Track subscription
    if (!this.subscriptions.has(streamId)) {
      this.subscriptions.set(streamId, new Set());
    }
    this.subscriptions.get(streamId).add(clientId);
    
    // Store filters in Redis
    await this.redis.hset(
      `stream:${streamId}:filters`,
      clientId,
      JSON.stringify(filters)
    );
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      streamId,
      filters,
      timestamp: Date.now()
    });
    
    // Send latest data if available
    const latestData = await this.redis.get(`stream:${streamId}:latest`);
    if (latestData) {
      this.sendToClient(clientId, {
        type: 'stream_data',
        streamId,
        data: JSON.parse(latestData),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Start Visual Stream
   */
  async startVisualStream(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.authenticated) {
      return this.sendToClient(clientId, {
        type: 'error',
        message: 'Authentication required',
        timestamp: Date.now()
      });
    }
    
    const streamId = data.streamId || uuidv4();
    const streamConfig = {
      id: streamId,
      athleteId: data.athleteId,
      type: data.streamType || 'live_overlay',
      resolution: data.resolution || '1920x1080',
      framerate: data.framerate || 30,
      startedAt: Date.now(),
      owner: clientId
    };
    
    // Start stream processing
    const stream = {
      ...streamConfig,
      interval: setInterval(async () => {
        await this.processStreamFrame(streamId);
      }, 1000 / streamConfig.framerate)
    };
    
    this.activeStreams.set(streamId, stream);
    
    // Initialize metrics
    this.streamMetrics.set(streamId, {
      frames: 0,
      bandwidth: 0,
      viewers: 0,
      quality: 100
    });
    
    this.sendToClient(clientId, {
      type: 'stream_started',
      streamId,
      config: streamConfig,
      timestamp: Date.now()
    });
    
    // Notify room
    await this.broadcastToRoom(`stream:${data.athleteId}`, {
      type: 'new_stream',
      streamId,
      athleteId: data.athleteId,
      timestamp: Date.now()
    });
  }

  /**
   * Process Stream Frame
   */
  async processStreamFrame(streamId) {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return;
    
    try {
      // Get latest enigma data
      const enigmaData = await this.redis.get(`enigma:${stream.athleteId}:latest`);
      if (!enigmaData) return;
      
      const data = JSON.parse(enigmaData);
      
      // Generate overlay data
      const overlayData = {
        streamId,
        frame: this.streamMetrics.get(streamId).frames++,
        timestamp: Date.now(),
        enigma: {
          score: data.score || 0,
          trend: data.trend || 'stable',
          dimensions: data.dimensions || {}
        },
        biometrics: {
          heartRate: data.heartRate || 0,
          heartRateZone: this.getHeartRateZone(data.heartRate),
          gsrLevel: data.gsrLevel || 'normal',
          flowState: data.flowState || 0
        },
        performance: {
          clutchFactor: data.clutchFactor || 0,
          momentum: data.momentum || 'neutral',
          prediction: data.nextPlayPrediction || null
        }
      };
      
      // Apply filters for each subscriber
      const subscribers = this.subscriptions.get(streamId) || new Set();
      
      for (const clientId of subscribers) {
        const filters = await this.redis.hget(
          `stream:${streamId}:filters`,
          clientId
        );
        
        let filteredData = overlayData;
        if (filters) {
          filteredData = this.applyFilters(overlayData, JSON.parse(filters));
        }
        
        this.sendToClient(clientId, {
          type: 'stream_frame',
          streamId,
          data: filteredData,
          timestamp: Date.now()
        });
      }
      
      // Store latest frame
      await this.redis.set(
        `stream:${streamId}:latest`,
        JSON.stringify(overlayData),
        'EX',
        60
      );
      
      // Update metrics
      const metrics = this.streamMetrics.get(streamId);
      metrics.bandwidth += JSON.stringify(overlayData).length;
      metrics.viewers = subscribers.size;
      
    } catch (error) {
      console.error(`Error processing stream ${streamId}:`, error);
    }
  }

  /**
   * Generate Custom Overlay
   */
  async generateOverlay(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      // Request overlay generation from Visual Engine
      const overlayRequest = {
        athleteId: data.athleteId,
        type: data.overlayType || 'standard',
        customization: data.customization || {},
        timestamp: Date.now()
      };
      
      // Publish request to visual engine
      await this.redis.publish(
        'visual:overlay_request',
        JSON.stringify({
          clientId,
          request: overlayRequest
        })
      );
      
      // Send acknowledgment
      this.sendToClient(clientId, {
        type: 'overlay_requested',
        requestId: data.requestId,
        status: 'processing',
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to generate overlay',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update Biometrics Stream
   */
  async updateBiometrics(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.authenticated) return;
    
    // Store biometric data
    await this.redis.hset(
      `biometrics:${client.athleteId}`,
      'latest',
      JSON.stringify({
        heartRate: data.heartRate,
        gsrLevel: data.gsrLevel,
        cortisol: data.cortisol,
        temperature: data.temperature,
        timestamp: Date.now()
      })
    );
    
    // Check for significant changes
    if (data.heartRate > 180 || data.gsrLevel === 'extreme') {
      await this.redis.publish('enigma:biometric_spike', JSON.stringify({
        athleteId: client.athleteId,
        ...data
      }));
    }
    
    // Broadcast to subscribers
    await this.broadcastToRoom(`athlete:${client.athleteId}`, {
      type: 'biometric_update',
      athleteId: client.athleteId,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Room Management
   */
  async joinRoom(clientId, room) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    
    this.rooms.get(room).add(clientId);
    
    this.sendToClient(clientId, {
      type: 'joined_room',
      room,
      members: this.rooms.get(room).size,
      timestamp: Date.now()
    });
    
    // Notify room members
    await this.broadcastToRoom(room, {
      type: 'member_joined',
      clientId,
      room,
      timestamp: Date.now()
    }, clientId);
  }

  async leaveRoom(clientId, room) {
    const roomMembers = this.rooms.get(room);
    if (roomMembers) {
      roomMembers.delete(clientId);
      
      if (roomMembers.size === 0) {
        this.rooms.delete(room);
      }
      
      // Notify remaining members
      await this.broadcastToRoom(room, {
        type: 'member_left',
        clientId,
        room,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Broadcast to Room
   */
  async broadcastToRoom(room, message, excludeClient = null) {
    const roomMembers = this.rooms.get(room);
    if (!roomMembers) return;
    
    for (const clientId of roomMembers) {
      if (clientId !== excludeClient) {
        this.sendToClient(clientId, message);
      }
    }
  }

  /**
   * Redis Subscriptions
   */
  setupRedisSubscriptions() {
    // Subscribe to visual engine events
    this.pubsub.subscribe(
      'visual:clutch_moment',
      'visual:evolution_update',
      'visual:prediction_ready',
      'visual:overlay_generated'
    );
    
    this.pubsub.on('message', async (channel, message) => {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'visual:clutch_moment':
          await this.handleClutchMoment(data);
          break;
          
        case 'visual:evolution_update':
          await this.handleEvolutionUpdate(data);
          break;
          
        case 'visual:prediction_ready':
          await this.handlePredictionReady(data);
          break;
          
        case 'visual:overlay_generated':
          await this.handleOverlayGenerated(data);
          break;
      }
    });
  }

  /**
   * Handle Visual Engine Events
   */
  async handleClutchMoment(data) {
    // Broadcast to all subscribers of this athlete
    await this.broadcastToRoom(`athlete:${data.athleteId}`, {
      type: 'clutch_moment',
      ...data,
      timestamp: Date.now()
    });
    
    // Store for replay
    await this.redis.zadd(
      `clutch_moments:${data.athleteId}`,
      Date.now(),
      JSON.stringify(data)
    );
  }

  async handleEvolutionUpdate(data) {
    await this.broadcastToRoom(`athlete:${data.athleteId}`, {
      type: 'evolution_update',
      ...data,
      timestamp: Date.now()
    });
  }

  async handlePredictionReady(data) {
    await this.broadcastToRoom(`athlete:${data.athleteId}`, {
      type: 'prediction_ready',
      ...data,
      timestamp: Date.now()
    });
  }

  async handleOverlayGenerated(data) {
    // Send to requesting client
    if (data.clientId) {
      this.sendToClient(data.clientId, {
        type: 'overlay_ready',
        ...data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle Client Disconnect
   */
  handleClientDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    console.log(`Client disconnected: ${clientId}`);
    
    // Clean up subscriptions
    for (const streamId of client.subscriptions) {
      const subscribers = this.subscriptions.get(streamId);
      if (subscribers) {
        subscribers.delete(clientId);
        if (subscribers.size === 0) {
          this.subscriptions.delete(streamId);
        }
      }
    }
    
    // Leave all rooms
    for (const [room, members] of this.rooms) {
      if (members.has(clientId)) {
        members.delete(clientId);
        if (members.size === 0) {
          this.rooms.delete(room);
        }
      }
    }
    
    // Stop owned streams
    for (const [streamId, stream] of this.activeStreams) {
      if (stream.owner === clientId) {
        this.stopVisualStream(clientId, { streamId });
      }
    }
    
    this.clients.delete(clientId);
  }

  /**
   * Stop Visual Stream
   */
  async stopVisualStream(clientId, data) {
    const stream = this.activeStreams.get(data.streamId);
    if (!stream) return;
    
    // Check ownership
    if (stream.owner !== clientId) {
      return this.sendToClient(clientId, {
        type: 'error',
        message: 'Not stream owner',
        timestamp: Date.now()
      });
    }
    
    // Clear interval
    clearInterval(stream.interval);
    
    // Remove stream
    this.activeStreams.delete(data.streamId);
    this.streamMetrics.delete(data.streamId);
    
    // Notify subscribers
    const subscribers = this.subscriptions.get(data.streamId) || new Set();
    for (const subscriberId of subscribers) {
      this.sendToClient(subscriberId, {
        type: 'stream_ended',
        streamId: data.streamId,
        timestamp: Date.now()
      });
    }
    
    // Clean up subscriptions
    this.subscriptions.delete(data.streamId);
    
    // Clean up Redis
    await this.redis.del(
      `stream:${data.streamId}:latest`,
      `stream:${data.streamId}:filters`
    );
    
    this.sendToClient(clientId, {
      type: 'stream_stopped',
      streamId: data.streamId,
      timestamp: Date.now()
    });
  }

  /**
   * Helper Methods
   */
  
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  }

  generateClientId() {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getHeartRateZone(heartRate) {
    if (heartRate < 100) return 'rest';
    if (heartRate < 120) return 'warmup';
    if (heartRate < 140) return 'moderate';
    if (heartRate < 160) return 'aerobic';
    if (heartRate < 180) return 'anaerobic';
    return 'maximum';
  }

  applyFilters(data, filters) {
    // Apply user-defined filters to data
    let filtered = { ...data };
    
    if (filters.excludeBiometrics) {
      delete filtered.biometrics;
    }
    
    if (filters.onlyClutch && filtered.performance.clutchFactor < 85) {
      return null;
    }
    
    if (filters.minEnigmaScore && filtered.enigma.score < filters.minEnigmaScore) {
      return null;
    }
    
    return filtered;
  }

  /**
   * Start Server
   */
  start(port = 8080) {
    this.server.listen(port, () => {
      console.log(`Blaze WebSocket Server running on port ${port}`);
    });
  }

  /**
   * Graceful Shutdown
   */
  async shutdown() {
    console.log('Shutting down WebSocket server...');
    
    // Stop all streams
    for (const [streamId, stream] of this.activeStreams) {
      clearInterval(stream.interval);
    }
    
    // Close all client connections
    for (const [clientId, client] of this.clients) {
      client.ws.close(1000, 'Server shutting down');
    }
    
    // Clear heartbeat
    clearInterval(this.heartbeatInterval);
    
    // Close WebSocket server
    this.wss.close();
    
    // Close Redis connections
    await this.redis.quit();
    await this.pubsub.quit();
    
    // Close HTTP server
    this.server.close();
    
    console.log('WebSocket server shut down complete');
  }
}

// Export and start server
export default BlazeWebSocketServer;

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = {
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    jwtSecret: process.env.JWT_SECRET || 'blaze_secret_key'
  };
  
  const server = new BlazeWebSocketServer(config);
  server.start(process.env.WS_PORT || 8080);
  
  // Graceful shutdown
  process.on('SIGTERM', () => server.shutdown());
  process.on('SIGINT', () => server.shutdown());
}