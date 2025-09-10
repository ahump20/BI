export interface Env {
  SPORTS_CACHE: KVNamespace;
  SPORTS_DATA: R2Bucket;
  ANALYTICS_DB: D1Database;
  RATE_LIMITER: DurableObjectNamespace;
  METRICS: AnalyticsEngineDataset;
  SPORTS_API_KEY: string;
}

// Rate limiter durable object
export class RateLimiter {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    const key = `rate:${ip}`;
    const now = Date.now();
    const window = 60000; // 1 minute window
    const limit = 100; // 100 requests per minute

    const requests = (await this.state.storage.get<number[]>(key)) || [];
    const recentRequests = requests.filter(time => now - time < window);
    
    if (recentRequests.length >= limit) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    recentRequests.push(now);
    await this.state.storage.put(key, recentRequests);
    
    return new Response('OK', { status: 200 });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Rate limiting check
    const rateLimiterId = env.RATE_LIMITER.idFromName(request.headers.get('CF-Connecting-IP') || 'global');
    const rateLimiterStub = env.RATE_LIMITER.get(rateLimiterId);
    const rateLimitResponse = await rateLimiterStub.fetch(request);
    
    if (rateLimitResponse.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: corsHeaders
      });
    }

    // Log metrics
    env.METRICS.writeDataPoint({
      blobs: [path],
      doubles: [1],
      indexes: [request.method]
    });

    try {
      // Route handling
      if (path.startsWith('/api/sports/')) {
        return await handleSportsData(request, env, path);
      } else if (path.startsWith('/api/predictions/')) {
        return await handlePredictions(request, env, path);
      } else if (path.startsWith('/api/vision/')) {
        return await handleVisionAI(request, env, path);
      } else if (path.startsWith('/api/nil/')) {
        return await handleNIL(request, env, path);
      } else if (path === '/api/health') {
        return await handleHealth(env);
      } else {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (event.cron) {
      case '*/5 * * * *':
        await updateLiveGames(env);
        break;
      case '0 */1 * * *':
        await aggregateStats(env);
        break;
      case '0 0 * * *':
        await dailyCleanup(env);
        break;
    }
  }
};

// Handler functions
async function handleSportsData(request: Request, env: Env, path: string): Promise<Response> {
  const league = path.split('/')[3]; // /api/sports/{league}
  const cacheKey = `sports:${league}`;
  
  // Check cache first
  const cached = await env.SPORTS_CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'X-Cache': 'HIT'
      }
    });
  }

  // Fetch from R2 storage
  const dataKey = `${league}/latest.json`;
  const object = await env.SPORTS_DATA.get(dataKey);
  
  if (!object) {
    return new Response(JSON.stringify({ error: 'Data not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const data = await object.text();
  
  // Cache for 5 minutes
  await env.SPORTS_CACHE.put(cacheKey, data, { expirationTtl: 300 });
  
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      'X-Cache': 'MISS'
    }
  });
}

async function handlePredictions(request: Request, env: Env, path: string): Promise<Response> {
  // Query D1 database for predictions
  const results = await env.ANALYTICS_DB.prepare(
    'SELECT * FROM predictions WHERE created_at > datetime("now", "-24 hours") ORDER BY confidence DESC LIMIT 10'
  ).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleVisionAI(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const formData = await request.formData();
  const video = formData.get('video') as File;
  
  if (!video) {
    return new Response(JSON.stringify({ error: 'No video provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Store video in R2
  const videoKey = `vision/${Date.now()}-${video.name}`;
  await env.SPORTS_DATA.put(videoKey, await video.arrayBuffer());

  // Queue for processing (would integrate with actual Vision AI service)
  const analysisId = crypto.randomUUID();
  await env.ANALYTICS_DB.prepare(
    'INSERT INTO vision_queue (id, video_key, status) VALUES (?, ?, ?)'
  ).bind(analysisId, videoKey, 'pending').run();

  return new Response(JSON.stringify({
    analysisId,
    status: 'queued',
    message: 'Video queued for analysis'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleNIL(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const data = await request.json() as any;
  
  // Simple NIL calculation logic
  const baseValues: { [key: string]: number } = {
    football: 50000,
    basketball: 45000,
    baseball: 35000,
    other: 25000
  };

  const base = baseValues[data.sport] || 25000;
  const performanceMultiplier = (data.performance / 100) + 0.5;
  const socialBoost = Math.log10(data.socialFollowers || 1000) * 0.1;
  
  const totalValue = Math.round(base * performanceMultiplier * (1 + socialBoost));

  // Store calculation in database
  await env.ANALYTICS_DB.prepare(
    'INSERT INTO nil_calculations (athlete_name, sport, value, calculated_at) VALUES (?, ?, ?, datetime("now"))'
  ).bind(data.athleteName, data.sport, totalValue).run();

  return new Response(JSON.stringify({
    athleteName: data.athleteName,
    sport: data.sport,
    totalValue,
    breakdown: {
      athletic: Math.round(totalValue * 0.5),
      academic: Math.round(totalValue * 0.2),
      social: Math.round(totalValue * 0.2),
      market: Math.round(totalValue * 0.1)
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleHealth(env: Env): Promise<Response> {
  const checks = {
    cache: false,
    storage: false,
    database: false
  };

  // Check KV
  try {
    await env.SPORTS_CACHE.get('health-check');
    checks.cache = true;
  } catch {}

  // Check R2
  try {
    await env.SPORTS_DATA.list({ limit: 1 });
    checks.storage = true;
  } catch {}

  // Check D1
  try {
    await env.ANALYTICS_DB.prepare('SELECT 1').first();
    checks.database = true;
  } catch {}

  const allHealthy = Object.values(checks).every(v => v);

  return new Response(JSON.stringify({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  }), {
    status: allHealthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Scheduled job functions
async function updateLiveGames(env: Env): Promise<void> {
  // Fetch live game data from external API
  console.log('Updating live games...');
  // Implementation would go here
}

async function aggregateStats(env: Env): Promise<void> {
  // Aggregate hourly statistics
  console.log('Aggregating stats...');
  // Implementation would go here
}

async function dailyCleanup(env: Env): Promise<void> {
  // Clean up old data
  console.log('Running daily cleanup...');
  await env.ANALYTICS_DB.prepare(
    'DELETE FROM vision_queue WHERE created_at < datetime("now", "-7 days")'
  ).run();
}