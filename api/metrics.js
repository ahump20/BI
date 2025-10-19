/**
 * Blaze Intelligence Metrics API
 * Collects and returns system metrics
 */

export default async function handler(request, env, ctx) {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        memory_usage: 'available_in_worker_context',
        cpu_time: 'tracked_by_cloudflare',
        requests_per_minute: 'tracked_by_analytics'
      },
      application: {
        active_sessions: await getActiveSessions(env),
        api_calls_24h: await getAPICalls24h(env),
        data_freshness: await getDataFreshness(env),
        error_rate: await getErrorRate(env)
      },
      sports_data: {
        cardinals_last_update: await getCardinalsLastUpdate(env),
        api_response_times: await getAPIResponseTimes(env),
        data_quality_score: await getDataQualityScore(env)
      }
    };

    return new Response(JSON.stringify(metrics, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to collect metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions for metrics collection
async function getActiveSessions(env) {
  try {
    if (env.USER_SESSIONS) {
      const sessions = await env.USER_SESSIONS.list({ limit: 1000 });
      return sessions.keys.length;
    }
    return 0;
  } catch {
    return 'unavailable';
  }
}

async function getAPICalls24h(env) {
  try {
    const kv = env.ANALYTICS_CACHE || env.CACHE;
    if (kv) {
      const cached = await kv.get('api_calls_24h');
      return cached ? parseInt(cached) : 0;
    }
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

async function getDataFreshness(env) {
  try {
    const kv = env.ANALYTICS_CACHE || env.CACHE;
    if (kv) {
      const lastUpdate = await kv.get('last_data_update');
      if (lastUpdate) {
        const age = Date.now() - new Date(lastUpdate).getTime();
        return Math.floor(age / (1000 * 60)); // Age in minutes
      }
    }
    return 'unknown';
  } catch {
    return 'unavailable';
  }
}

async function getErrorRate(env) {
  try {
    const kv = env.ANALYTICS_CACHE || env.CACHE;
    if (kv) {
      const errors = await kv.get('error_count_24h');
      const requests = await kv.get('request_count_24h');
      if (errors && requests) {
        return ((parseInt(errors) / parseInt(requests)) * 100).toFixed(2) + '%';
      }
    }
    return '0%';
  } catch {
    return 'unavailable';
  }
}

async function getCardinalsLastUpdate(env) {
  try {
    if (env.SPORTS_DATA) {
      const lastUpdate = await env.SPORTS_DATA.get('cardinals_last_update');
      return lastUpdate || 'never';
    }
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

async function getAPIResponseTimes(env) {
  try {
    const kv = env.ANALYTICS_CACHE || env.CACHE;
    if (kv) {
      const times = await kv.get('api_response_times');
      return times ? JSON.parse(times) : {};
    }
    return {};
  } catch {
    return {};
  }
}

async function getDataQualityScore(env) {
  try {
    const kv = env.ANALYTICS_CACHE || env.CACHE;
    if (kv) {
      const score = await kv.get('data_quality_score');
      return score ? parseFloat(score) : 95.0;
    }
    return 95.0;
  } catch {
    return 'unavailable';
  }
}
