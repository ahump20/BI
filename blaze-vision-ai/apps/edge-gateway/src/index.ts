/**
 * Blaze Vision AI - Edge Gateway
 * Cloudflare Workers entry point with routing and middleware
 * Handles authentication, validation, and routing to Durable Objects
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { SessionDurableObject } from './SessionDurableObject';
import { 
  monitoringMiddleware, 
  getMetrics, 
  isSystemHealthy,
  incrementTelemetryCounter,
  checkPerformanceAlerts
} from './middleware/monitoring';

// Environment bindings
interface Environment {
  SESSION_STORAGE: DurableObjectNamespace<SessionDurableObject>;
  BASELINE_TRACKER: DurableObjectNamespace;
  VISION_CACHE: KVNamespace;
  VISION_STORAGE: R2Bucket;
  FEATURE_QUEUE: Queue;
  DB: D1Database;
  JWT_SECRET: string;
  REDIS_URL?: string;
  POSTGRES_URL?: string;
}

// Request validation schemas
const SessionStartSchema = z.object({
  session_id: z.string().uuid(),
  player_id: z.string().min(1).max(100),
  sport: z.enum(['baseball', 'softball', 'football', 'basketball']),
  consent_token: z.string().optional(),
  target_fps: z.number().min(15).max(240).default(60),
  enable_face: z.boolean().default(true),
  enable_pose: z.boolean().default(true),
  enable_rpg: z.boolean().default(false)
});

const FeaturePacketSchema = z.object({
  session_id: z.string().uuid(),
  t: z.number(),
  face: z.object({
    blink: z.union([z.literal(0), z.literal(1)]),
    eye_ar: z.number(),
    gaze: z.array(z.number()).length(3),
    head_euler: z.array(z.number()).length(3),
    au_intensities: z.object({
      au4: z.number(),
      au5_7: z.number(),
      au9_10: z.number(),
      au14: z.number(),
      au17_23_24: z.number()
    }),
    qc: z.object({
      detection_confidence: z.number(),
      tracking_stability: z.number(),
      motion_blur: z.number(),
      illumination: z.number(),
      occlusion_ratio: z.number()
    })
  }).optional(),
  pose: z.object({
    kp: z.array(z.array(z.number()).length(4)),
    angles: z.object({
      arm_slot: z.number(),
      shoulder_separation: z.number(),
      stride_length: z.number(),
      release_height: z.number(),
      balance_score: z.number(),
      consistency_score: z.number()
    }),
    qc: z.object({
      detection_confidence: z.number(),
      tracking_stability: z.number(),
      motion_blur: z.number(),
      illumination: z.number(),
      occlusion_ratio: z.number()
    })
  }).optional(),
  device: z.object({
    fps: z.number(),
    resolution: z.array(z.number()).length(2),
    has_webgpu: z.boolean(),
    has_webgl: z.boolean(),
    camera_count: z.number()
  })
});

const GameSituationSchema = z.object({
  inning: z.number().min(1).max(15),
  outs: z.number().min(0).max(2),
  bases: z.string().regex(/^[01]{3}$/),
  score_diff: z.number().min(-50).max(50)
});

// Initialize Hono app
const app = new Hono<{ Bindings: Environment }>();

// Monitoring middleware (first for accurate metrics)
app.use('*', monitoringMiddleware);

// CORS middleware
app.use('*', cors({
  origin: [
    'https://coach.blaze-vision-ai.com',
    'https://coach-staging.blaze-vision-ai.com', 
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Enhanced health check with system status
app.get('/healthz', (c) => {
  const healthy = isSystemHealthy();
  const alerts = checkPerformanceAlerts();
  
  return c.json({ 
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'blaze-vision-ai-gateway',
    version: '1.0.0',
    alerts: alerts.length > 0 ? alerts : undefined
  }, healthy ? 200 : 503);
});

// Detailed metrics endpoint for monitoring
app.get('/metrics', (c) => {
  return c.json(getMetrics());
});

// JWT middleware for protected routes
app.use('/vision/*', async (c, next) => {
  // Skip auth for development
  if (c.req.header('X-Dev-Mode') === 'true') {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  try {
    const token = authHeader.slice(7);
    // Simple JWT validation - would use proper JWT middleware in production
    const payload = await jwt({ secret: c.env.JWT_SECRET }).verify(token);
    c.set('user', payload);
    return next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Session Routes
app.post('/vision/sessions', async (c) => {
  try {
    const body = await c.req.json();
    const sessionData = SessionStartSchema.parse(body);

    // Get Durable Object instance - use idFromName for UUID compatibility
    const sessionId = c.env.SESSION_STORAGE.idFromName(sessionData.session_id);
    const sessionObject = c.env.SESSION_STORAGE.get(sessionId);

    // Forward to Durable Object
    const response = await sessionObject.fetch(new Request('https://session/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    }));

    const result = await response.json();
    
    // Cache session info
    await c.env.VISION_CACHE.put(
      `session:${sessionData.session_id}:info`,
      JSON.stringify({
        player_id: sessionData.player_id,
        sport: sessionData.sport,
        start_time: Date.now()
      }),
      { expirationTtl: 86400 } // 24 hours
    );

    return c.json(result, response.status);
  } catch (error) {
    console.error('Session start error:', error);
    return c.json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.issues : 'Unknown error'
    }, 400);
  }
});

// Telemetry ingestion - CORE ENDPOINT
app.post('/vision/telemetry', async (c) => {
  const startTime = Date.now();
  
  try {
    const body = await c.req.json();
    
    // Handle both single packet and array
    const packets = Array.isArray(body) ? body : [body];
    
    // Validate packets
    const validatedPackets = packets.map(packet => FeaturePacketSchema.parse(packet));
    
    if (validatedPackets.length === 0) {
      return c.json({ error: 'No valid packets provided' }, 400);
    }

    // Get session ID from first packet
    const sessionId = validatedPackets[0].session_id;
    
    // Route to appropriate Durable Object
    const durableObjectId = c.env.SESSION_STORAGE.idFromName(sessionId);
    const sessionObject = c.env.SESSION_STORAGE.get(durableObjectId);

    // Forward packets to Durable Object for processing
    const response = await sessionObject.fetch(new Request('https://session/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedPackets)
    }));

    const result = await response.json();
    
    // Add performance metrics
    const processingTime = Date.now() - startTime;
    result.gateway_latency_ms = processingTime;
    
    // Update monitoring metrics
    incrementTelemetryCounter(packets.length);
    
    // Performance logging
    if (processingTime > 100) { // Log slow requests
      console.warn(`Slow telemetry processing: ${processingTime}ms for ${packets.length} packets`);
    }

    return c.json(result, response.status);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Telemetry error:', error, `Processing time: ${processingTime}ms`);
    
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Invalid packet data',
        details: error.issues,
        gateway_latency_ms: processingTime
      }, 400);
    }
    
    return c.json({ 
      error: 'Processing failed',
      gateway_latency_ms: processingTime
    }, 500);
  }
});

// Event logging (pitch outcomes, etc.)
app.post('/vision/event', async (c) => {
  try {
    const body = await c.req.json();
    const { session_id, type, label, outcome, meta } = body;

    if (!session_id || !type) {
      return c.json({ error: 'session_id and type are required' }, 400);
    }

    // Route to session Durable Object
    const sessionId = c.env.SESSION_STORAGE.idFromName(session_id);
    const sessionObject = c.env.SESSION_STORAGE.get(sessionId);

    const response = await sessionObject.fetch(new Request('https://session/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label, outcome, meta, timestamp: Date.now() })
    }));

    return c.json(await response.json(), response.status);
  } catch (error) {
    console.error('Event logging error:', error);
    return c.json({ error: 'Event logging failed' }, 500);
  }
});

// Real-time streaming endpoint
app.get('/vision/session/:sessionId/stream', async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // Validate session exists
  const sessionInfo = await c.env.VISION_CACHE.get(`session:${sessionId}:info`);
  if (!sessionInfo) {
    return c.json({ error: 'Session not found' }, 404);
  }

  // Route to Durable Object for WebSocket handling
  const durableObjectId = c.env.SESSION_STORAGE.idFromName(sessionId);
  const sessionObject = c.env.SESSION_STORAGE.get(durableObjectId);

  return sessionObject.fetch(new Request('https://session/stream', {
    headers: c.req.raw.headers
  }));
});

// Get session scores (for UI)
app.get('/vision/session/:sessionId/scores', async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // Try cache first for performance
  const cached = await c.env.VISION_CACHE.get(`scores:${sessionId}:latest`);
  if (cached) {
    return c.json({
      success: true,
      scores: JSON.parse(cached),
      source: 'cache',
      timestamp: Date.now()
    });
  }

  // Route to Durable Object
  const durableObjectId = c.env.SESSION_STORAGE.idFromName(sessionId);
  const sessionObject = c.env.SESSION_STORAGE.get(durableObjectId);

  const response = await sessionObject.fetch(new Request(`https://session/scores?${c.req.url.split('?')[1] || ''}`, {
    method: 'GET'
  }));

  return c.json(await response.json(), response.status);
});

// Update game situation
app.post('/vision/session/:sessionId/situation', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const body = await c.req.json();
    const situation = GameSituationSchema.parse(body);

    // Route to Durable Object
    const durableObjectId = c.env.SESSION_STORAGE.idFromString(sessionId);
    const sessionObject = c.env.SESSION_STORAGE.get(durableObjectId);

    const response = await sessionObject.fetch(new Request('https://session/situation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(situation)
    }));

    return c.json(await response.json(), response.status);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Invalid game situation',
        details: error.issues
      }, 400);
    }
    return c.json({ error: 'Update failed' }, 500);
  }
});

// Session status and stats
app.get('/vision/session/:sessionId/status', async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // Route to Durable Object
  const durableObjectId = c.env.SESSION_STORAGE.idFromName(sessionId);
  const sessionObject = c.env.SESSION_STORAGE.get(durableObjectId);

  const response = await sessionObject.fetch(new Request('https://session/status', {
    method: 'GET'
  }));

  return c.json(await response.json(), response.status);
});

// End session
app.delete('/vision/session/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  
  // Route to Durable Object
  const durableObjectId = c.env.SESSION_STORAGE.idFromName(sessionId);
  const sessionObject = c.env.SESSION_STORAGE.get(durableObjectId);

  const response = await sessionObject.fetch(new Request('https://session/session', {
    method: 'DELETE'
  }));

  // Clean up cache
  await c.env.VISION_CACHE.delete(`session:${sessionId}:info`);
  await c.env.VISION_CACHE.delete(`scores:${sessionId}:latest`);

  return c.json(await response.json(), response.status);
});

// Analytics endpoints
app.get('/vision/analytics/player/:playerId/summary', async (c) => {
  try {
    const playerId = c.req.param('playerId');
    const sport = c.req.query('sport');
    
    const db = new (await import('./services/DatabaseService')).DatabaseService(c.env.DB);
    const summary = await db.getPlayerSessionSummary(playerId, sport);
    
    return c.json({ success: true, summary });
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ error: 'Analytics query failed' }, 500);
  }
});

app.get('/vision/analytics/player/:playerId/trends', async (c) => {
  try {
    const playerId = c.req.param('playerId');
    const days = parseInt(c.req.query('days') || '30');
    
    const db = new (await import('./services/DatabaseService')).DatabaseService(c.env.DB);
    const trends = await db.getPlayerPerformanceTrends(playerId, days);
    
    return c.json({ success: true, trends });
  } catch (error) {
    console.error('Trends error:', error);
    return c.json({ error: 'Trends query failed' }, 500);
  }
});

app.get('/vision/analytics/system/stats', async (c) => {
  try {
    const db = new (await import('./services/DatabaseService')).DatabaseService(c.env.DB);
    const stats = await db.getSystemStats();
    
    return c.json({ success: true, stats });
  } catch (error) {
    console.error('System stats error:', error);
    return c.json({ error: 'System stats query failed' }, 500);
  }
});

// Model versions endpoint (for SDK compatibility)
app.get('/vision/models', (c) => {
  return c.json({
    models: {
      face_landmarker: {
        version: '1.0.0',
        url: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      },
      pose_landmarker: {
        version: '1.0.0', 
        url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker/float16/1/pose_landmarker.task'
      }
    },
    grit_fusion_version: '2.0.0',
    last_updated: '2024-01-24T00:00:00Z'
  });
});

// Coaching cue endpoint
app.post('/vision/cue', async (c) => {
  try {
    const body = await c.req.json();
    const { session_id, type, message, meta } = body;

    // Log coaching cue for effectiveness tracking
    const cue = {
      session_id,
      type, // 'reset', 'drill', 'mechanical', 'mental'
      message,
      meta,
      timestamp: Date.now()
    };

    // Store in KV for analytics
    await c.env.VISION_CACHE.put(
      `cue:${session_id}:${Date.now()}`,
      JSON.stringify(cue),
      { expirationTtl: 3600 } // 1 hour
    );

    return c.json({ success: true, cue_id: `${session_id}-${Date.now()}` });
  } catch (error) {
    return c.json({ error: 'Failed to log coaching cue' }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error('Gateway error:', err);
  return c.json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    request_id: crypto.randomUUID()
  }, 500);
});

// 404 handler  
app.notFound((c) => {
  return c.json({
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /healthz',
      'POST /vision/sessions',
      'POST /vision/telemetry', 
      'GET /vision/session/:id/stream',
      'GET /vision/session/:id/scores',
      'POST /vision/session/:id/situation',
      'DELETE /vision/session/:id'
    ]
  }, 404);
});

// Queue message handler
async function queue(batch: MessageBatch<any>, env: Environment): Promise<void> {
  for (const message of batch.messages) {
    try {
      // Process analytics messages here
      console.log('Processing queue message:', message.body);
      // TODO: Forward to TimescaleDB for warm storage
      message.ack();
    } catch (error) {
      console.error('Queue processing error:', error);
      message.retry();
    }
  }
}

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,
  queue,
};

// Export Durable Object classes
export { SessionDurableObject } from './SessionDurableObject';
export { BaselineTracker } from './BaselineTracker';