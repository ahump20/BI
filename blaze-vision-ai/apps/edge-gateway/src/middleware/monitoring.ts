/**
 * Enterprise Monitoring Middleware
 * Tracks performance, errors, and system health for production deployment
 */

import { Context, Next } from 'hono';

interface MonitoringMetrics {
  requests_total: number;
  requests_by_endpoint: Record<string, number>;
  error_count: number;
  avg_response_time: number;
  active_sessions: number;
  telemetry_packets_processed: number;
  database_operations: number;
  cache_hits: number;
  cache_misses: number;
}

// In-memory metrics (for demo - in production would use external metrics service)
const metrics: MonitoringMetrics = {
  requests_total: 0,
  requests_by_endpoint: {},
  error_count: 0,
  avg_response_time: 0,
  active_sessions: 0,
  telemetry_packets_processed: 0,
  database_operations: 0,
  cache_hits: 0,
  cache_misses: 0
};

const response_times: number[] = [];

export async function monitoringMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const path = new URL(c.req.url).pathname;
  
  // Increment request counters
  metrics.requests_total++;
  metrics.requests_by_endpoint[path] = (metrics.requests_by_endpoint[path] || 0) + 1;
  
  // Add request metadata
  c.set('request_start_time', startTime);
  c.set('monitoring_path', path);
  
  try {
    await next();
    
    // Track successful response
    const responseTime = Date.now() - startTime;
    response_times.push(responseTime);
    
    // Keep only last 1000 response times for average calculation
    if (response_times.length > 1000) {
      response_times.shift();
    }
    
    // Update average response time
    metrics.avg_response_time = Math.round(
      response_times.reduce((sum, time) => sum + time, 0) / response_times.length
    );
    
    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${path} took ${responseTime}ms`);
    }
    
  } catch (error) {
    // Track errors
    metrics.error_count++;
    
    console.error('Request error:', {
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    throw error; // Re-throw to maintain error handling
  }
}

// Metrics endpoint for monitoring systems
export function getMetrics(): MonitoringMetrics & { 
  uptime_ms: number; 
  memory_used_mb?: number;
  timestamp: string;
} {
  return {
    ...metrics,
    uptime_ms: Date.now(),
    timestamp: new Date().toISOString()
  };
}

// Health check logic
export function isSystemHealthy(): boolean {
  const recentErrors = metrics.error_count;
  const avgResponseTime = metrics.avg_response_time;
  
  // System is unhealthy if:
  // - Average response time > 5 seconds
  // - Error rate > 10% (simplified check)
  const errorRate = metrics.requests_total > 0 ? recentErrors / metrics.requests_total : 0;
  
  return avgResponseTime < 5000 && errorRate < 0.1;
}

// Update telemetry metrics
export function incrementTelemetryCounter(packets: number = 1): void {
  metrics.telemetry_packets_processed += packets;
}

// Update active sessions
export function updateActiveSessions(count: number): void {
  metrics.active_sessions = count;
}

// Update database metrics
export function incrementDatabaseOps(): void {
  metrics.database_operations++;
}

// Update cache metrics
export function incrementCacheHit(): void {
  metrics.cache_hits++;
}

export function incrementCacheMiss(): void {
  metrics.cache_misses++;
}

// Performance alerts (would integrate with external alerting in production)
export function checkPerformanceAlerts(): string[] {
  const alerts: string[] = [];
  
  if (metrics.avg_response_time > 2000) {
    alerts.push(`HIGH_LATENCY: Average response time is ${metrics.avg_response_time}ms`);
  }
  
  if (metrics.error_count > 100) {
    alerts.push(`HIGH_ERROR_RATE: ${metrics.error_count} errors recorded`);
  }
  
  const cacheHitRate = metrics.cache_hits / (metrics.cache_hits + metrics.cache_misses) || 0;
  if (cacheHitRate < 0.7) {
    alerts.push(`LOW_CACHE_HIT_RATE: Cache hit rate is ${Math.round(cacheHitRate * 100)}%`);
  }
  
  return alerts;
}