#!/usr/bin/env node

/**
 * Blaze Intelligence Real-Time Monitoring Dashboard
 * Live system health, performance metrics, and operational insights
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import OptimizedSportsDataService from '../services/optimized-sports-data-service.js';
import SecurityConfig from '../config/security-config.js';
import EnvironmentManager from '../config/environment-manager.js';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonitoringDashboard {
  constructor(options = {}) {
    this.port = options.port || 8095;
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    
    // Initialize services
    this.sportsService = new OptimizedSportsDataService();
    this.securityConfig = new SecurityConfig(this.environment);
    this.envManager = new EnvironmentManager();
    
    // Dashboard state
    this.metrics = {
      system: {
        uptime: 0,
        memory: {},
        cpu: 0,
        lastUpdated: new Date().toISOString()
      },
      performance: {
        avgResponseTime: 0,
        requestCount: 0,
        errorRate: 0,
        cacheHitRatio: 0
      },
      security: {
        securityScore: 0,
        rateLimitHits: 0,
        blockedRequests: 0,
        lastSecurityScan: null
      },
      sports: {
        activeTeams: 0,
        dataFreshness: {},
        apiStatus: {},
        lastDataUpdate: null
      }
    };
    
    this.clients = new Set();
    this.updateInterval = null;
  }

  async initialize() {
    console.log('🚀 Initializing Blaze Intelligence Monitoring Dashboard...');
    
    // Initialize services
    await this.sportsService.initialize();
    
    // Setup Express app
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: this.environment === 'production' 
          ? ['https://blaze-intelligence.com', 'https://app.blaze-intelligence.com']
          : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8090'],
        methods: ['GET', 'POST']
      }
    });

    // Apply security middleware
    const securityMiddleware = this.securityConfig.getExpressMiddleware();
    securityMiddleware.forEach(middleware => this.app.use(middleware));

    this.setupRoutes();
    this.setupSocketHandlers();
    
    console.log('✅ Monitoring Dashboard initialized');
  }

  setupRoutes() {
    // Serve dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // API endpoints
    this.app.get('/api/metrics', (req, res) => {
      res.json({
        success: true,
        metrics: this.metrics,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        environment: this.environment,
        services: {
          sportsData: this.sportsService.initialized,
          security: true,
          monitoring: true
        },
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/performance', async (req, res) => {
      try {
        const performanceMetrics = await this.sportsService.getPerformanceMetrics();
        res.json({
          success: true,
          performance: performanceMetrics,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    this.app.get('/api/security-report', (req, res) => {
      try {
        const securityReport = this.securityConfig.getSecurityReport();
        res.json({
          success: true,
          security: securityReport,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Static assets
    this.app.use('/static', express.static(path.join(__dirname, '../public')));
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📊 Dashboard client connected: ${socket.id}`);
      this.clients.add(socket);

      // Send initial metrics
      socket.emit('metrics-update', this.metrics);

      // Handle client requests
      socket.on('request-metrics', () => {
        socket.emit('metrics-update', this.metrics);
      });

      socket.on('trigger-security-scan', async () => {
        try {
          const securityReport = this.securityConfig.getSecurityReport();
          this.metrics.security.securityScore = securityReport.audit.score;
          this.metrics.security.lastSecurityScan = new Date().toISOString();
          
          socket.emit('security-scan-complete', securityReport);
          this.broadcastMetrics();
        } catch (error) {
          socket.emit('security-scan-error', { error: error.message });
        }
      });

      socket.on('request-team-data', async (teamKey) => {
        try {
          const teamData = await this.sportsService.getTeamData(teamKey);
          socket.emit('team-data-update', { teamKey, data: teamData });
        } catch (error) {
          socket.emit('team-data-error', { teamKey, error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`📊 Dashboard client disconnected: ${socket.id}`);
        this.clients.delete(socket);
      });
    });
  }

  async updateMetrics() {
    const startTime = performance.now();

    try {
      // System metrics
      this.metrics.system = {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        lastUpdated: new Date().toISOString()
      };

      // Performance metrics
      try {
        const performanceData = await this.sportsService.getPerformanceMetrics();
        this.metrics.performance = {
          avgResponseTime: parseFloat(performanceData.performance.avg_response_time) || 0,
          requestCount: performanceData.cache.total_keys || 0,
          errorRate: 0, // Would be calculated from actual error tracking
          cacheHitRatio: parseFloat(performanceData.performance.cache_hit_ratio) || 0
        };
      } catch (error) {
        console.warn('⚠️  Could not get performance metrics:', error.message);
      }

      // Security metrics
      try {
        const securityReport = this.securityConfig.getSecurityReport();
        this.metrics.security.securityScore = securityReport.audit.score;
      } catch (error) {
        console.warn('⚠️  Could not get security metrics:', error.message);
      }

      // Sports data metrics
      try {
        const sportsMetrics = await this.sportsService.getPerformanceMetrics();
        this.metrics.sports = {
          activeTeams: 4, // Cardinals, Titans, Longhorns, Grizzlies
          dataFreshness: {
            cache: sportsMetrics.cache.status,
            lastUpdate: new Date().toISOString()
          },
          apiStatus: sportsMetrics.performance.rate_limit_status || {},
          lastDataUpdate: new Date().toISOString()
        };
      } catch (error) {
        console.warn('⚠️  Could not get sports metrics:', error.message);
      }

      const duration = performance.now() - startTime;
      console.log(`📊 Metrics updated in ${Math.round(duration)}ms`);

    } catch (error) {
      console.error('❌ Error updating metrics:', error.message);
    }
  }

  broadcastMetrics() {
    if (this.clients.size > 0) {
      this.io.emit('metrics-update', this.metrics);
      console.log(`📡 Broadcast metrics to ${this.clients.size} clients`);
    }
  }

  startMetricsUpdates() {
    // Update metrics immediately
    this.updateMetrics();

    // Set up periodic updates
    this.updateInterval = setInterval(async () => {
      await this.updateMetrics();
      this.broadcastMetrics();
    }, 10000); // Update every 10 seconds

    console.log('📊 Real-time metrics updates started (10s interval)');
  }

  stopMetricsUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('📊 Metrics updates stopped');
    }
  }

  generateDashboardHTML() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blaze Intelligence - Monitoring Dashboard</title>
        <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #0a0b1e 0%, #1a1b3c 50%, #2a2b5c 100%);
                color: #ffffff;
                min-height: 100vh;
                overflow-x: hidden;
            }
            
            .dashboard-header {
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                padding: 1rem 2rem;
                border-bottom: 1px solid rgba(191, 87, 0, 0.3);
                display: flex;
                justify-content: between;
                align-items: center;
            }
            
            .logo {
                font-size: 1.5rem;
                font-weight: bold;
                color: #BF5700;
                text-shadow: 0 0 10px rgba(191, 87, 0, 0.5);
            }
            
            .status-badge {
                background: #00B2A9;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .dashboard-container {
                padding: 2rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
                max-width: 1600px;
                margin: 0 auto;
            }
            
            .metric-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.3s ease;
            }
            
            .metric-card:hover {
                border-color: rgba(191, 87, 0, 0.5);
                box-shadow: 0 8px 32px rgba(191, 87, 0, 0.2);
                transform: translateY(-2px);
            }
            
            .card-header {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .card-icon {
                font-size: 1.5rem;
                margin-right: 0.75rem;
            }
            
            .card-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #BF5700;
            }
            
            .metric-value {
                font-size: 2rem;
                font-weight: bold;
                color: #9BCBEB;
                margin-bottom: 0.5rem;
            }
            
            .metric-label {
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 1rem;
            }
            
            .metric-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
            }
            
            .metric-item {
                text-align: center;
            }
            
            .metric-item-value {
                font-size: 1.25rem;
                font-weight: bold;
                color: #00B2A9;
            }
            
            .metric-item-label {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 0.25rem;
            }
            
            .chart-container {
                height: 200px;
                margin-top: 1rem;
            }
            
            .action-button {
                background: linear-gradient(45deg, #BF5700, #FF7A00);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 1rem;
            }
            
            .action-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(191, 87, 0, 0.4);
            }
            
            .status-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 0.5rem;
            }
            
            .status-healthy { background-color: #00B2A9; }
            .status-warning { background-color: #FFB800; }
            .status-error { background-color: #FF4444; }
            
            .live-indicator {
                display: flex;
                align-items: center;
                font-size: 0.875rem;
                color: #00B2A9;
                margin-left: auto;
            }
            
            .live-dot {
                width: 6px;
                height: 6px;
                background: #00B2A9;
                border-radius: 50%;
                margin-right: 0.5rem;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            
            .team-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .team-status:last-child {
                border-bottom: none;
            }
        </style>
    </head>
    <body>
        <div class="dashboard-header">
            <div class="logo">🔥 Blaze Intelligence</div>
            <div class="live-indicator">
                <div class="live-dot"></div>
                Real-time Monitoring
            </div>
            <div class="status-badge" id="connectionStatus">Connecting...</div>
        </div>
        
        <div class="dashboard-container">
            <!-- System Health -->
            <div class="metric-card">
                <div class="card-header">
                    <div class="card-icon">💻</div>
                    <div class="card-title">System Health</div>
                </div>
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-item-value" id="uptime">0s</div>
                        <div class="metric-item-label">Uptime</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-item-value" id="memory">0MB</div>
                        <div class="metric-item-label">Memory Usage</div>
                    </div>
                </div>
            </div>
            
            <!-- Performance Metrics -->
            <div class="metric-card">
                <div class="card-header">
                    <div class="card-icon">⚡</div>
                    <div class="card-title">Performance</div>
                </div>
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-item-value" id="responseTime">0ms</div>
                        <div class="metric-item-label">Avg Response</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-item-value" id="cacheHitRatio">0%</div>
                        <div class="metric-item-label">Cache Hit Rate</div>
                    </div>
                </div>
            </div>
            
            <!-- Security Status -->
            <div class="metric-card">
                <div class="card-header">
                    <div class="card-icon">🔒</div>
                    <div class="card-title">Security</div>
                </div>
                <div class="metric-value" id="securityScore">0/100</div>
                <div class="metric-label">Security Score</div>
                <button class="action-button" onclick="triggerSecurityScan()">
                    Run Security Scan
                </button>
            </div>
            
            <!-- Sports Data Status -->
            <div class="metric-card">
                <div class="card-header">
                    <div class="card-icon">🏈</div>
                    <div class="card-title">Sports Data</div>
                </div>
                <div class="metric-value" id="activeTeams">4</div>
                <div class="metric-label">Active Teams</div>
                <div id="teamStatuses">
                    <div class="team-status">
                        <span>Cardinals (MLB)</span>
                        <span class="status-indicator status-healthy"></span>
                    </div>
                    <div class="team-status">
                        <span>Titans (NFL)</span>
                        <span class="status-indicator status-healthy"></span>
                    </div>
                    <div class="team-status">
                        <span>Longhorns (NCAA)</span>
                        <span class="status-indicator status-healthy"></span>
                    </div>
                    <div class="team-status">
                        <span>Grizzlies (NBA)</span>
                        <span class="status-indicator status-healthy"></span>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            const socket = io();
            let isConnected = false;
            
            socket.on('connect', () => {
                isConnected = true;
                document.getElementById('connectionStatus').textContent = 'Connected';
                document.getElementById('connectionStatus').style.background = '#00B2A9';
                console.log('📊 Connected to monitoring dashboard');
            });
            
            socket.on('disconnect', () => {
                isConnected = false;
                document.getElementById('connectionStatus').textContent = 'Disconnected';
                document.getElementById('connectionStatus').style.background = '#FF4444';
                console.log('📊 Disconnected from monitoring dashboard');
            });
            
            socket.on('metrics-update', (metrics) => {
                updateDashboard(metrics);
            });
            
            socket.on('security-scan-complete', (report) => {
                console.log('🔒 Security scan complete:', report);
                document.getElementById('securityScore').textContent = report.audit.score + '/100';
            });
            
            function updateDashboard(metrics) {
                // System metrics
                document.getElementById('uptime').textContent = formatUptime(metrics.system.uptime);
                document.getElementById('memory').textContent = formatBytes(metrics.system.memory.heapUsed);
                
                // Performance metrics
                document.getElementById('responseTime').textContent = metrics.performance.avgResponseTime + 'ms';
                document.getElementById('cacheHitRatio').textContent = metrics.performance.cacheHitRatio + '%';
                
                // Security metrics
                document.getElementById('securityScore').textContent = metrics.security.securityScore + '/100';
                
                // Sports metrics
                document.getElementById('activeTeams').textContent = metrics.sports.activeTeams;
                
                console.log('📊 Dashboard updated', metrics);
            }
            
            function formatUptime(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                
                if (hours > 0) return hours + 'h ' + minutes + 'm';
                if (minutes > 0) return minutes + 'm ' + secs + 's';
                return secs + 's';
            }
            
            function formatBytes(bytes) {
                if (bytes === 0) return '0B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
            }
            
            function triggerSecurityScan() {
                socket.emit('trigger-security-scan');
                document.getElementById('connectionStatus').textContent = 'Scanning...';
                document.getElementById('connectionStatus').style.background = '#FFB800';
                
                setTimeout(() => {
                    if (isConnected) {
                        document.getElementById('connectionStatus').textContent = 'Connected';
                        document.getElementById('connectionStatus').style.background = '#00B2A9';
                    }
                }, 3000);
            }
            
            // Request initial metrics
            setTimeout(() => {
                socket.emit('request-metrics');
            }, 1000);
        </script>
    </body>
    </html>
    `;
  }

  async start() {
    try {
      await this.initialize();
      
      return new Promise((resolve, reject) => {
        this.server.on('error', reject);
        
        this.server.listen(this.port, () => {
          console.log(`🚀 Blaze Intelligence Monitoring Dashboard running`);
          console.log(`📊 Dashboard URL: http://localhost:${this.port}`);
          console.log(`🔧 Environment: ${this.environment}`);
          console.log(`📡 WebSocket connections: Real-time updates enabled`);
          
          this.startMetricsUpdates();
          resolve(this.server);
        });
      });
    } catch (error) {
      console.error('❌ Failed to start monitoring dashboard:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping monitoring dashboard...');
    
    this.stopMetricsUpdates();
    
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🔒 Monitoring dashboard stopped');
          resolve();
        });
      });
    }
    
    await this.sportsService.close();
  }
}

// Start dashboard if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new MonitoringDashboard({
    port: process.argv[2] ? parseInt(process.argv[2]) : 8095,
    environment: process.argv[3] || process.env.NODE_ENV || 'development'
  });
  
  dashboard.start().catch(error => {
    console.error('❌ Dashboard startup failed:', error.message);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down monitoring dashboard...');
    await dashboard.stop();
    process.exit(0);
  });
}

export default MonitoringDashboard;