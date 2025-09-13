/**
 * Unified API Middleware for Blaze Intelligence Platform
 * Consolidates routing for all API functions from multiple deployments
 * Maintains compatibility with legacy URLs while providing unified access
 */

export default async function middleware(request, context) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // CORS headers for unified API access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  // API Route Mapping - Preserving all legacy routes
  const routeMap = {
    // Core Analytics APIs
    '/api/analytics': './analytics.js',
    '/api/advanced-analytics': './advanced-analytics.js',
    '/api/blaze-analytics': './blaze-analytics-api.js',
    '/api/team-intelligence': './team-intelligence-api.js',
    
    // Sports Data Integration
    '/api/perfect-game': './perfect-game-integration.js',
    '/api/live-metrics': './enhanced-live-metrics.js',
    '/api/live-data': './live-data-engine.js',
    '/api/live-connections': './live-connections.js',
    '/api/cardinals': './cardinals/cardinals-readiness.js',
    
    // NIL & Business Intelligence
    '/api/nil-calculator': './enhanced-nil-calculator.js',
    '/api/nil': './enhanced-nil-calculator.js',
    
    // Authentication & User Management
    '/api/auth': './auth.js',
    '/api/onboarding': './automated-onboarding.js',
    '/api/client-onboarding': './client-onboarding.js',
    
    // Payment & Business Operations
    '/api/stripe': './stripe-integration.js',
    '/api/subscription': './stripe-subscription.js',
    '/api/payment': './payment-processor.js',
    
    // CRM & Content Management
    '/api/hubspot': './hubspot-integration.js',
    '/api/crm': './crm-integration.js',
    '/api/notion': './notion-cms.js',
    '/api/lead': './lead-capture.js',
    '/api/contact': './contact-form.js',
    
    // AI & Advanced Features (Replit Integration)
    '/api/consciousness': './consciousness-level.js',
    '/api/consciousness-stream': './consciousness-stream.js',
    '/api/narrative': './narrative-generator.js',
    '/api/biometrics': './biometrics.js',
    '/api/video-intelligence': './video-intelligence-api.js',
    
    // System & Infrastructure
    '/api/health': './health.js',
    '/api/status': './status.js',
    '/api/metrics': './metrics.js',
    '/api/system-monitor': './system-monitor.js',
    '/api/gateway': './enhanced-gateway.js',
    '/api/proxy': './proxy.js',
    
    // Legacy Route Compatibility
    '/.netlify/functions/analytics': './analytics.js',
    '/.netlify/functions/lead-capture': './lead-capture.js',
    '/.netlify/functions/nil-calculator': './enhanced-nil-calculator.js',
    '/.netlify/functions/perfect-game': './perfect-game-integration.js',
    
    // Replit Legacy Routes
    '/api/ai-consciousness': './consciousness-level.js',
    '/api/neural-network': './narrative-generator.js',
    '/api/video-analysis': './video-intelligence-api.js',
  };

  // Performance monitoring
  const startTime = Date.now();
  
  try {
    // Find matching route
    const handler = routeMap[path];
    
    if (handler) {
      // Dynamic import of the handler
      const module = await import(handler);
      const handlerFunction = module.default || module.handler;
      
      if (typeof handlerFunction === 'function') {
        // Execute the handler
        const response = await handlerFunction(request, context);
        
        // Add CORS headers to response
        const modifiedHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          modifiedHeaders.set(key, value);
        });
        
        // Add performance metrics
        modifiedHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`);
        modifiedHeaders.set('X-Powered-By', 'Blaze Intelligence Unified Platform');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: modifiedHeaders,
        });
      }
    }
    
    // Handle unmatched routes
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({
        error: 'API endpoint not found',
        availableEndpoints: Object.keys(routeMap).filter(r => r.startsWith('/api/')).sort(),
        documentation: 'https://blaze-intelligence.netlify.app/api-docs'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Pass through non-API requests
    return context.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred processing your request',
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

// Export configuration
export const config = {
  path: '/*',
  excludedPaths: ['/assets/*', '/images/*', '/css/*', '/js/*', '/fonts/*']
};