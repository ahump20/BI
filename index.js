/**
 * Blaze Intelligence Platform - Cloudflare Worker Entry Point
 * Main router for all API endpoints and static content
 */

import healthHandler from './api/health.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    try {
      // Route API endpoints
      if (path.startsWith('/api/')) {
        let response;

        switch (path) {
          case '/api/health':
            response = await healthHandler(request, env, ctx);
            break;

          case '/api/biometrics':
            // Import biometrics handler dynamically if it exists
            try {
              const biometricsHandler = await import('./api/biometrics.js');
              response = await biometricsHandler.default(request, env, ctx);
            } catch (e) {
              response = new Response(JSON.stringify({
                error: 'Biometrics API not available',
                message: 'Service temporarily unavailable'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            break;

          default:
            response = new Response(JSON.stringify({
              error: 'Endpoint not found',
              available_endpoints: ['/api/health', '/api/biometrics'],
              timestamp: new Date().toISOString()
            }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            });
        }

        // Add CORS headers to API responses
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        return response;
      }

      // Serve static content (fallback)
      const staticResponse = await serveStatic(request, env);
      return staticResponse;

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

/**
 * Serve static content or redirect to GitHub Pages
 */
async function serveStatic(request, env) {
  const url = new URL(request.url);
  
  // Redirect to GitHub Pages for static content
  const githubPagesUrl = `https://ahump20.github.io/BI${url.pathname}${url.search}`;
  
  return new Response(JSON.stringify({
    message: 'Blaze Intelligence Platform',
    description: 'Sports Analytics and AI-powered Systems',
    version: '1.0.0',
    static_content: githubPagesUrl,
    api_base: url.origin + '/api',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      biometrics: '/api/biometrics',
      main_site: 'https://ahump20.github.io/BI',
      cardinals: 'https://ahump20.github.io/BI/cardinals',
      mobile_app: 'https://ahump20.github.io/BI/mobile-app'
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'X-Platform': 'Blaze Intelligence',
      'Access-Control-Allow-Origin': '*'
    }
  });
}