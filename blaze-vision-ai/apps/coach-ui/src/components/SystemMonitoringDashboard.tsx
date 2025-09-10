/**
 * System Monitoring Dashboard
 * Real-time system health and performance metrics for enterprise deployment
 */

import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

interface SystemMetrics {
  requests_total: number;
  requests_by_endpoint: Record<string, number>;
  error_count: number;
  avg_response_time: number;
  active_sessions: number;
  telemetry_packets_processed: number;
  database_operations: number;
  cache_hits: number;
  cache_misses: number;
  uptime_ms: number;
  timestamp: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  alerts?: string[];
}

const SystemMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch health status
        const healthResponse = await fetch(`${API_CONFIG.GATEWAY_URL}/healthz`);
        const healthData = await healthResponse.json();
        setHealth(healthData);

        // Fetch detailed metrics
        const metricsResponse = await fetch(`${API_CONFIG.GATEWAY_URL}/metrics`);
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1001
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            background: health?.status === 'healthy' ? '#28a745' : '#dc3545',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
          title="Open System Monitor"
        >
          📊
        </button>
      </div>
    );
  }

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getCacheHitRate = (): number => {
    if (!metrics || (metrics.cache_hits + metrics.cache_misses) === 0) return 0;
    return Math.round((metrics.cache_hits / (metrics.cache_hits + metrics.cache_misses)) * 100);
  };

  const getErrorRate = (): number => {
    if (!metrics || metrics.requests_total === 0) return 0;
    return Math.round((metrics.error_count / metrics.requests_total) * 100);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      background: 'rgba(0, 0, 0, 0.95)',
      border: '1px solid #BF5700',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000,
      overflow: 'auto',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ 
          color: '#BF5700', 
          margin: 0,
          fontSize: '16px'
        }}>
          🔥 System Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#BF5700',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>

      {/* System Health */}
      <div style={{
        background: health?.status === 'healthy' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
        border: `1px solid ${health?.status === 'healthy' ? '#28a745' : '#dc3545'}`,
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '15px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '5px' 
        }}>
          <span style={{ 
            color: health?.status === 'healthy' ? '#28a745' : '#dc3545',
            marginRight: '8px'
          }}>
            {health?.status === 'healthy' ? '🟢' : '🔴'}
          </span>
          <strong>System Status: {health?.status?.toUpperCase()}</strong>
        </div>
        
        {health?.alerts && health.alerts.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <strong style={{ color: '#FFB81C' }}>⚠️ Alerts:</strong>
            {health.alerts.map((alert, i) => (
              <div key={i} style={{ 
                marginLeft: '10px',
                color: '#dc3545',
                fontSize: '11px'
              }}>
                • {alert}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              background: 'rgba(191, 87, 0, 0.1)',
              border: '1px solid #BF5700',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#FFB81C', fontSize: '18px', fontWeight: 'bold' }}>
                {metrics.avg_response_time}ms
              </div>
              <div style={{ color: '#ccc', fontSize: '10px' }}>Avg Response</div>
            </div>

            <div style={{
              background: 'rgba(191, 87, 0, 0.1)',
              border: '1px solid #BF5700',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#FFB81C', fontSize: '18px', fontWeight: 'bold' }}>
                {getErrorRate()}%
              </div>
              <div style={{ color: '#ccc', fontSize: '10px' }}>Error Rate</div>
            </div>

            <div style={{
              background: 'rgba(191, 87, 0, 0.1)',
              border: '1px solid #BF5700',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#FFB81C', fontSize: '18px', fontWeight: 'bold' }}>
                {metrics.active_sessions}
              </div>
              <div style={{ color: '#ccc', fontSize: '10px' }}>Active Sessions</div>
            </div>

            <div style={{
              background: 'rgba(191, 87, 0, 0.1)',
              border: '1px solid #BF5700',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#FFB81C', fontSize: '18px', fontWeight: 'bold' }}>
                {getCacheHitRate()}%
              </div>
              <div style={{ color: '#ccc', fontSize: '10px' }}>Cache Hit Rate</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#BF5700', marginBottom: '8px', fontWeight: 'bold' }}>
              📈 Traffic Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '11px' }}>
              <div>Total Requests: <span style={{ color: '#FFB81C' }}>{metrics.requests_total.toLocaleString()}</span></div>
              <div>Database Ops: <span style={{ color: '#FFB81C' }}>{metrics.database_operations.toLocaleString()}</span></div>
              <div>Telemetry Packets: <span style={{ color: '#FFB81C' }}>{metrics.telemetry_packets_processed.toLocaleString()}</span></div>
              <div>Cache Hits: <span style={{ color: '#FFB81C' }}>{metrics.cache_hits.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Popular Endpoints */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#BF5700', marginBottom: '8px', fontWeight: 'bold' }}>
              🔥 Popular Endpoints
            </div>
            {Object.entries(metrics.requests_by_endpoint)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([endpoint, count]) => (
                <div key={endpoint} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  marginBottom: '3px'
                }}>
                  <span style={{ 
                    color: '#ccc',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px'
                  }}>
                    {endpoint}
                  </span>
                  <span style={{ color: '#FFB81C' }}>{count}</span>
                </div>
              ))}
          </div>

          {/* System Info */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '10px'
          }}>
            <div style={{ color: '#BF5700', marginBottom: '5px', fontWeight: 'bold' }}>
              ⚙️ System Info
            </div>
            <div>Service: <span style={{ color: '#FFB81C' }}>{health?.service} v{health?.version}</span></div>
            <div>Uptime: <span style={{ color: '#FFB81C' }}>{formatUptime(metrics.uptime_ms)}</span></div>
            <div>Last Updated: <span style={{ color: '#FFB81C' }}>
              {new Date(metrics.timestamp).toLocaleTimeString()}
            </span></div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemMonitoringDashboard;