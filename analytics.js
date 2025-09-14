/**
 * Blaze Intelligence Analytics API
 * Handles analytics data collection and processing
 */

const fs = require('fs').promises;
const path = require('path');

// In-memory storage for development (use database in production)
const analyticsStorage = {
  events: [],
  sessions: new Map(),
  users: new Map(),
  metrics: new Map()
};

/**
 * Process analytics events and extract insights
 */
function processAnalyticsEvents(events) {
  const processed = {
    page_views: 0,
    user_actions: 0,
    api_calls: 0,
    errors: 0,
    performance_metrics: [],
    cardinals_interactions: 0,
    feature_usage: new Map(),
    user_engagement: {
      avg_session_duration: 0,
      bounce_rate: 0,
      pages_per_session: 0
    }
  };
  
  events.forEach(event => {
    switch (event.name) {
      case 'page_view':
        processed.page_views++;
        break;
      case 'user_action':
        processed.user_actions++;
        break;
      case 'api_call':
        processed.api_calls++;
        if (event.properties.duration) {
          processed.performance_metrics.push({
            type: 'api_response_time',
            value: event.properties.duration,
            endpoint: event.properties.endpoint
          });
        }
        break;
      case 'error':
        processed.errors++;
        break;
      case 'cardinals_interaction':
        processed.cardinals_interactions++;
        break;
      case 'feature_usage':
        const feature = event.properties.feature;
        const currentCount = processed.feature_usage.get(feature) || 0;
        processed.feature_usage.set(feature, currentCount + 1);
        break;
    }
  });
  
  return processed;
}

/**
 * Generate analytics insights
 */
function generateInsights(processedData, timeframe = '24h') {
  const insights = [];
  
  // Performance insights
  if (processedData.performance_metrics.length > 0) {
    const avgResponseTime = processedData.performance_metrics
      .reduce((sum, metric) => sum + metric.value, 0) / processedData.performance_metrics.length;
    
    insights.push({
      type: 'performance',
      metric: 'avg_api_response_time',
      value: Math.round(avgResponseTime),
      unit: 'ms',
      trend: avgResponseTime < 200 ? 'good' : avgResponseTime < 500 ? 'warning' : 'critical',
      message: `Average API response time: ${Math.round(avgResponseTime)}ms`
    });
  }
  
  // User engagement insights
  if (processedData.page_views > 0) {
    insights.push({
      type: 'engagement',
      metric: 'total_page_views',
      value: processedData.page_views,
      trend: 'neutral',
      message: `${processedData.page_views} page views in ${timeframe}`
    });
  }
  
  // Cardinals specific insights
  if (processedData.cardinals_interactions > 0) {
    insights.push({
      type: 'business',
      metric: 'cardinals_engagement',
      value: processedData.cardinals_interactions,
      trend: 'positive',
      message: `${processedData.cardinals_interactions} Cardinals analytics interactions`
    });
  }
  
  // Error rate insights
  const totalEvents = processedData.page_views + processedData.user_actions + processedData.api_calls;
  if (totalEvents > 0) {
    const errorRate = (processedData.errors / totalEvents) * 100;
    insights.push({
      type: 'reliability',
      metric: 'error_rate',
      value: Math.round(errorRate * 100) / 100,
      unit: '%',
      trend: errorRate < 1 ? 'good' : errorRate < 5 ? 'warning' : 'critical',
      message: `Error rate: ${Math.round(errorRate * 100) / 100}%`
    });
  }
  
  return insights;
}

/**
 * Store analytics data
 */
async function storeAnalyticsData(payload) {
  try {
    // Store events
    analyticsStorage.events.push(...payload.events);
    
    // Update session data
    if (payload.session) {
      analyticsStorage.sessions.set(payload.session.id, {
        ...payload.session,
        lastActivity: Date.now()
      });
    }
    
    // Update user data
    if (payload.user) {
      analyticsStorage.users.set(payload.user.id, {
        ...payload.user,
        lastSeen: Date.now()
      });
    }
    
    // Process and store metrics
    const processed = processAnalyticsEvents(payload.events);
    const insights = generateInsights(processed);
    
    // Store processed metrics
    analyticsStorage.metrics.set(Date.now(), {
      processed,
      insights,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 events in memory
    if (analyticsStorage.events.length > 1000) {
      analyticsStorage.events = analyticsStorage.events.slice(-1000);
    }
    
    // Log analytics summary for debugging
    console.log('📊 Analytics processed:', {
      events: payload.events.length,
      session: payload.session?.id,
      user: payload.user?.id,
      insights: insights.length
    });
    
    return { success: true, insights };
  } catch (error) {
    console.error('Analytics storage error:', error);
    throw error;
  }
}

/**
 * Generate analytics dashboard data
 */
function generateDashboardData() {
  const now = Date.now();
  const last24h = now - (24 * 60 * 60 * 1000);
  
  // Filter recent events
  const recentEvents = analyticsStorage.events.filter(
    event => event.properties.timestamp > last24h
  );
  
  // Process recent data
  const processed = processAnalyticsEvents(recentEvents);
  const insights = generateInsights(processed);
  
  // Calculate user metrics
  const activeSessions = Array.from(analyticsStorage.sessions.values())
    .filter(session => (now - session.lastActivity) < (30 * 60 * 1000)); // 30 minutes
  
  const activeUsers = Array.from(analyticsStorage.users.values())
    .filter(user => (now - user.lastSeen) < (24 * 60 * 60 * 1000)); // 24 hours
  
  return {
    overview: {
      total_events: recentEvents.length,
      active_sessions: activeSessions.length,
      active_users: activeUsers.length,
      error_rate: processed.errors > 0 ? 
        (processed.errors / recentEvents.length * 100).toFixed(2) : 0
    },
    metrics: processed,
    insights,
    performance: {
      avg_api_response_time: processed.performance_metrics.length > 0 ?
        Math.round(processed.performance_metrics.reduce((sum, m) => sum + m.value, 0) / processed.performance_metrics.length) : null,
      total_api_calls: processed.api_calls,
      error_count: processed.errors
    },
    engagement: {
      page_views: processed.page_views,
      user_actions: processed.user_actions,
      cardinals_interactions: processed.cardinals_interactions,
      feature_usage: Object.fromEntries(processed.feature_usage)
    },
    timeframe: '24h',
    generated_at: new Date().toISOString()
  };
}

/**
 * Main handler for analytics API
 */
exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters } = event;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    switch (httpMethod) {
      case 'POST':
        // Handle analytics data ingestion
        const payload = JSON.parse(event.body);
        
        if (!payload.events || !Array.isArray(payload.events)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Invalid payload: events array required' 
            })
          };
        }
        
        const result = await storeAnalyticsData(payload);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            processed: payload.events.length,
            insights: result.insights,
            timestamp: new Date().toISOString()
          })
        };
      
      case 'GET':
        // Handle analytics dashboard/reporting
        const action = queryStringParameters?.action || 'dashboard';
        
        switch (action) {
          case 'dashboard':
            const dashboardData = generateDashboardData();
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                data: dashboardData
              })
            };
          
          case 'health':
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                status: 'operational',
                events_stored: analyticsStorage.events.length,
                active_sessions: analyticsStorage.sessions.size,
                unique_users: analyticsStorage.users.size,
                timestamp: new Date().toISOString()
              })
            };
          
          case 'insights':
            const allEvents = analyticsStorage.events;
            const processed = processAnalyticsEvents(allEvents);
            const insights = generateInsights(processed);
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                insights,
                metrics: processed,
                timestamp: new Date().toISOString()
              })
            };
          
          default:
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ 
                error: 'Invalid action parameter' 
              })
            };
        }
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ 
            error: 'Method not allowed' 
          })
        };
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    };
  }
};

// For local testing
if (require.main === module) {
  console.log('🧪 Testing Analytics API...');
  
  // Simulate some test events
  const testEvents = [
    {
      type: 'event',
      name: 'page_view',
      properties: {
        timestamp: Date.now(),
        session_id: 'test_session',
        user_id: 'test_user',
        page_url: 'https://blaze-intelligence.netlify.app/'
      }
    },
    {
      type: 'event', 
      name: 'cardinals_interaction',
      properties: {
        timestamp: Date.now(),
        interaction_type: 'readiness_view',
        readiness_score: 86.65
      }
    },
    {
      type: 'event',
      name: 'api_call',
      properties: {
        timestamp: Date.now(),
        endpoint: '/api/enhanced-gateway',
        duration: 150,
        success: true
      }
    }
  ];
  
  storeAnalyticsData({
    events: testEvents,
    session: { id: 'test_session', startTime: Date.now() },
    user: { id: 'test_user' }
  }).then(() => {
    const dashboard = generateDashboardData();
    console.log('✅ Analytics test completed');
    console.log('Dashboard data:', JSON.stringify(dashboard, null, 2));
  }).catch(console.error);
}