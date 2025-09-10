/**
 * Blaze Visual Engine API
 * REST API endpoints for visual generation
 */

import express from 'express';
import { BlazeVisualEngine } from './blaze-visual-engine.js';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

// Initialize services
const app = express();
const redis = new Redis(process.env.REDIS_URL);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize Visual Engine
const visualEngine = new BlazeVisualEngine({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
});

// Cache helper
class VisualCache {
  async get(key) {
    try {
      const cached = await redis.get(`visual:${key}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (new Date(data.expires) > new Date()) {
          return data;
        }
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }
    return null;
  }

  async set(key, data, ttl = 3600) {
    try {
      const cacheData = {
        ...data,
        expires: new Date(Date.now() + ttl * 1000).toISOString(),
        cached: true
      };
      await redis.set(
        `visual:${key}`,
        JSON.stringify(cacheData),
        'EX',
        ttl
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern) {
    try {
      const keys = await redis.keys(`visual:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}

const cache = new VisualCache();

// Metrics tracking
class Metrics {
  async track(event, data) {
    try {
      await supabase.from('visual_metrics').insert({
        id: uuidv4(),
        event,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Metrics tracking error:', error);
    }
  }

  async trackGeneration(type, duration, success) {
    await this.track('visual_generation', {
      type,
      duration,
      success,
      timestamp: Date.now()
    });
  }
}

const metrics = new Metrics();

// === API ENDPOINTS ===

/**
 * Generate Player Evolution Visual
 */
app.post('/api/visuals/evolution', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { athleteId, evolutionData } = req.body;
    
    if (!athleteId) {
      return res.status(400).json({ error: 'athleteId is required' });
    }

    // Check cache
    const cacheKey = `evolution:${athleteId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      await metrics.track('cache_hit', { type: 'evolution' });
      return res.json(cached);
    }

    // Generate visual
    const visual = await visualEngine.createEvolutionVisual(
      athleteId,
      evolutionData || {}
    );

    // Store in database
    const { data, error } = await supabase
      .from('visual_generations')
      .insert({
        id: uuidv4(),
        athlete_id: athleteId,
        visual_type: 'evolution',
        cloudinary_url: visual,
        transformation_params: evolutionData,
        generated_at: new Date().toISOString()
      });

    if (error) throw error;

    const response = {
      id: data[0].id,
      url: visual,
      type: 'evolution',
      athleteId,
      generatedAt: new Date().toISOString()
    };

    // Cache result
    await cache.set(cacheKey, response, 86400); // 24 hours

    // Track metrics
    await metrics.trackGeneration('evolution', Date.now() - startTime, true);

    res.json(response);
  } catch (error) {
    console.error('Evolution visual error:', error);
    await metrics.trackGeneration('evolution', Date.now() - startTime, false);
    res.status(500).json({ error: 'Failed to generate evolution visual' });
  }
});

/**
 * Generate Champion Dimension Badges
 */
app.post('/api/visuals/badges', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { athleteId, dimensions, ranks } = req.body;
    
    if (!athleteId || !dimensions) {
      return res.status(400).json({ 
        error: 'athleteId and dimensions are required' 
      });
    }

    // Check cache
    const cacheKey = `badges:${athleteId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      await metrics.track('cache_hit', { type: 'badges' });
      return res.json(cached);
    }

    // Generate badges
    const badges = await visualEngine.createAllDimensionBadges({
      id: athleteId,
      dimensions,
      ranks
    });

    // Store in database
    const { data, error } = await supabase
      .from('visual_generations')
      .insert({
        id: uuidv4(),
        athlete_id: athleteId,
        visual_type: 'badges',
        cloudinary_url: badges.map(b => b.url),
        transformation_params: { dimensions, ranks },
        generated_at: new Date().toISOString()
      });

    if (error) throw error;

    const response = {
      id: data[0].id,
      badges,
      type: 'badges',
      athleteId,
      generatedAt: new Date().toISOString()
    };

    // Cache result
    await cache.set(cacheKey, response, 86400);

    // Track metrics
    await metrics.trackGeneration('badges', Date.now() - startTime, true);

    res.json(response);
  } catch (error) {
    console.error('Badges visual error:', error);
    await metrics.trackGeneration('badges', Date.now() - startTime, false);
    res.status(500).json({ error: 'Failed to generate badges' });
  }
});

/**
 * Generate Performance Prediction Overlay
 */
app.post('/api/visuals/prediction', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { athleteId, predictionData } = req.body;
    
    if (!athleteId || !predictionData) {
      return res.status(400).json({ 
        error: 'athleteId and predictionData are required' 
      });
    }

    // Check cache
    const cacheKey = `prediction:${athleteId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      await metrics.track('cache_hit', { type: 'prediction' });
      return res.json(cached);
    }

    // Generate prediction overlay
    const visual = await visualEngine.createPredictionOverlay(
      athleteId,
      predictionData
    );

    // Store in database
    const { data, error } = await supabase
      .from('visual_generations')
      .insert({
        id: uuidv4(),
        athlete_id: athleteId,
        visual_type: 'prediction',
        cloudinary_url: visual,
        transformation_params: predictionData,
        enigma_data: predictionData,
        generated_at: new Date().toISOString()
      });

    if (error) throw error;

    const response = {
      id: data[0].id,
      url: visual,
      type: 'prediction',
      athleteId,
      predictionData,
      generatedAt: new Date().toISOString()
    };

    // Cache result
    await cache.set(cacheKey, response, 3600); // 1 hour (predictions update frequently)

    // Track metrics
    await metrics.trackGeneration('prediction', Date.now() - startTime, true);

    res.json(response);
  } catch (error) {
    console.error('Prediction visual error:', error);
    await metrics.trackGeneration('prediction', Date.now() - startTime, false);
    res.status(500).json({ error: 'Failed to generate prediction overlay' });
  }
});

/**
 * Highlight Clutch Moment
 */
app.post('/api/visuals/clutch', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { momentData } = req.body;
    
    if (!momentData || !momentData.frameId) {
      return res.status(400).json({ 
        error: 'momentData with frameId is required' 
      });
    }

    // Generate clutch highlight
    const visual = await visualEngine.highlightClutchMoment(momentData);

    // Store in database
    const { data, error } = await supabase
      .from('visual_generations')
      .insert({
        id: uuidv4(),
        athlete_id: momentData.athleteId,
        visual_type: 'clutch',
        cloudinary_url: visual,
        transformation_params: momentData,
        enigma_data: {
          clutchScore: momentData.clutchScore,
          heartRate: momentData.heartRate,
          gsrLevel: momentData.gsrLevel
        },
        generated_at: new Date().toISOString()
      });

    if (error) throw error;

    const response = {
      id: data[0].id,
      url: visual,
      type: 'clutch',
      momentData,
      generatedAt: new Date().toISOString()
    };

    // Track metrics
    await metrics.trackGeneration('clutch', Date.now() - startTime, true);

    // Broadcast to connected clients if clutch score is high
    if (momentData.clutchScore >= 90) {
      await broadcastClutchMoment(response);
    }

    res.json(response);
  } catch (error) {
    console.error('Clutch visual error:', error);
    await metrics.trackGeneration('clutch', Date.now() - startTime, false);
    res.status(500).json({ error: 'Failed to generate clutch highlight' });
  }
});

/**
 * Generate Team Composite Visual
 */
app.post('/api/visuals/team', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { teamId, players } = req.body;
    
    if (!teamId || !players || !Array.isArray(players)) {
      return res.status(400).json({ 
        error: 'teamId and players array are required' 
      });
    }

    // Check cache
    const cacheKey = `team:${teamId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      await metrics.track('cache_hit', { type: 'team' });
      return res.json(cached);
    }

    // Generate team visuals
    const teamVisuals = await visualEngine.processTeamVisuals(teamId, players);

    // Store in database
    const { data, error } = await supabase
      .from('visual_generations')
      .insert({
        id: uuidv4(),
        athlete_id: teamId,
        visual_type: 'team_composite',
        cloudinary_url: teamVisuals.teamComposite,
        transformation_params: { teamId, playerCount: players.length },
        generated_at: new Date().toISOString()
      });

    if (error) throw error;

    const response = {
      id: data[0].id,
      ...teamVisuals,
      generatedAt: new Date().toISOString()
    };

    // Cache result
    await cache.set(cacheKey, response, 86400);

    // Track metrics
    await metrics.trackGeneration('team', Date.now() - startTime, true);

    res.json(response);
  } catch (error) {
    console.error('Team visual error:', error);
    await metrics.trackGeneration('team', Date.now() - startTime, false);
    res.status(500).json({ error: 'Failed to generate team composite' });
  }
});

/**
 * Upload Athlete Image
 */
app.post('/api/visuals/upload', upload.single('image'), async (req, res) => {
  try {
    const { athleteId, year } = req.body;
    const file = req.file;

    if (!athleteId || !file) {
      return res.status(400).json({ 
        error: 'athleteId and image file are required' 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = visualEngine.cloudinary.uploader.upload_stream(
        {
          folder: `blaze/athletes/${athleteId}`,
          public_id: year || 'current',
          overwrite: true,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    // Store in database
    await supabase.from('visual_assets').insert({
      id: uuidv4(),
      asset_type: 'athlete_image',
      cloudinary_public_id: result.public_id,
      metadata: {
        athleteId,
        year,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height
      },
      uploaded_at: new Date().toISOString()
    });

    // Invalidate cache for this athlete
    await cache.invalidate(`*:${athleteId}*`);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

/**
 * Get Visual History
 */
app.get('/api/visuals/history/:athleteId', async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { type, limit = 10, offset = 0 } = req.query;

    let query = supabase
      .from('visual_generations')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('visual_type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      visuals: data,
      athleteId,
      count: data.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get visual history' });
  }
});

/**
 * Clear Cache
 */
app.delete('/api/visuals/cache', async (req, res) => {
  try {
    const { pattern = '*' } = req.body;
    
    // Verify admin authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await cache.invalidate(pattern);
    
    res.json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

/**
 * Get Analytics
 */
app.get('/api/visuals/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = supabase
      .from('visual_metrics')
      .select('*')
      .order('timestamp', { ascending: false });

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate aggregates
    const analytics = {
      totalGenerations: data.filter(d => d.event === 'visual_generation').length,
      cacheHits: data.filter(d => d.event === 'cache_hit').length,
      averageGenerationTime: calculateAverage(
        data.filter(d => d.event === 'visual_generation'),
        'data.duration'
      ),
      successRate: calculateSuccessRate(
        data.filter(d => d.event === 'visual_generation')
      ),
      byType: groupByType(data),
      timeline: groupByHour(data)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Helper functions
function calculateAverage(data, path) {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], item);
    return acc + (value || 0);
  }, 0);
  return sum / data.length;
}

function calculateSuccessRate(data) {
  if (data.length === 0) return 0;
  const successful = data.filter(d => d.data?.success).length;
  return (successful / data.length) * 100;
}

function groupByType(data) {
  const types = {};
  data.forEach(item => {
    if (item.data?.type) {
      types[item.data.type] = (types[item.data.type] || 0) + 1;
    }
  });
  return types;
}

function groupByHour(data) {
  const hourly = {};
  data.forEach(item => {
    const hour = new Date(item.timestamp).getHours();
    hourly[hour] = (hourly[hour] || 0) + 1;
  });
  return hourly;
}

// WebSocket support for real-time updates
let wss;

async function broadcastClutchMoment(data) {
  if (wss) {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'clutch_moment',
          data
        }));
      }
    });
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Blaze Visual Engine API',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Blaze Visual Engine API running on port ${PORT}`);
});

// Initialize WebSocket server
import { WebSocketServer } from 'ws';
wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

export default app;