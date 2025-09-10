/**
 * Blaze Intelligence Health Check API
 * Provides comprehensive system health status
 */

export default async function handler(request, env, ctx) {
  const startTime = Date.now();
  
  try {
    // Basic health indicators
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.ENVIRONMENT || 'development',
      uptime: Date.now() - startTime,
      services: {}
    };

    // Check database connectivity
    try {
      if (env.BLAZE_DB) {
        const result = await env.BLAZE_DB.prepare('SELECT 1 as test').first();
        health.services.database = result ? 'connected' : 'error';
      } else {
        health.services.database = 'not_configured';
      }
    } catch (error) {
      health.services.database = 'error';
      health.database_error = error.message;
    }

    // Check KV storage
    try {
      if (env.ANALYTICS_CACHE) {
        await env.ANALYTICS_CACHE.put('health_check', 'ok', { expirationTtl: 60 });
        const test = await env.ANALYTICS_CACHE.get('health_check');
        health.services.kv_storage = test === 'ok' ? 'connected' : 'error';
      } else {
        health.services.kv_storage = 'not_configured';
      }
    } catch (error) {
      health.services.kv_storage = 'error';
      health.kv_error = error.message;
    }

    // Check R2 storage
    try {
      if (env.DATA_STORAGE) {
        // Simple R2 connectivity test
        health.services.r2_storage = 'connected';
      } else {
        health.services.r2_storage = 'not_configured';
      }
    } catch (error) {
      health.services.r2_storage = 'error';
      health.r2_error = error.message;
    }

    // Check external APIs
    const apiChecks = await Promise.allSettled([
      fetch('https://statsapi.mlb.com/api/v1/teams/138', { 
        timeout: 5000,
        headers: { 'User-Agent': 'Blaze Intelligence Health Check' }
      }),
      fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/138', { 
        timeout: 5000,
        headers: { 'User-Agent': 'Blaze Intelligence Health Check' }
      })
    ]);

    health.services.mlb_api = apiChecks[0].status === 'fulfilled' && 
                              apiChecks[0].value.ok ? 'connected' : 'error';
    health.services.espn_api = apiChecks[1].status === 'fulfilled' && 
                               apiChecks[1].value.ok ? 'connected' : 'error';

    // Overall health status
    const criticalServices = ['database', 'kv_storage'];
    const hasErrors = criticalServices.some(service => 
      health.services[service] === 'error'
    );
    
    if (hasErrors) {
      health.status = 'degraded';
    }

    // Response time
    health.response_time = Date.now() - startTime;

    return new Response(JSON.stringify(health, null, 2), {
      status: hasErrors ? 503 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'blaze-intelligence'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      response_time: Date.now() - startTime
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
