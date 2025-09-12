#!/usr/bin/env node

/**
 * Start Blaze Intelligence Monitoring Dashboard
 * Launch script for real-time monitoring system
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import MonitoringDashboard from '../components/monitoring-dashboard.js';
import { performance } from 'perf_hooks';

class DashboardLauncher {
  constructor() {
    this.dashboard = null;
    this.config = {
      port: process.env.MONITORING_PORT || 8095,
      environment: process.env.NODE_ENV || 'development',
      autoRestart: true,
      maxRestarts: 5,
      restartDelay: 5000
    };
    this.restartCount = 0;
  }

  async launch() {
    console.log('🚀 Blaze Intelligence Monitoring Dashboard Launcher');
    console.log('━'.repeat(60));
    
    const startTime = performance.now();
    
    try {
      console.log(`📊 Launching monitoring dashboard...`);
      console.log(`🌐 Port: ${this.config.port}`);
      console.log(`🔧 Environment: ${this.config.environment}`);
      console.log(`🔄 Auto-restart: ${this.config.autoRestart ? 'Enabled' : 'Disabled'}`);
      
      this.dashboard = new MonitoringDashboard({
        port: this.config.port,
        environment: this.config.environment
      });
      
      await this.dashboard.start();
      
      const duration = performance.now() - startTime;
      console.log(`✅ Dashboard launched successfully in ${Math.round(duration)}ms`);
      console.log(`📊 Access dashboard at: http://localhost:${this.config.port}`);
      
      this.setupErrorHandlers();
      
    } catch (error) {
      console.error('❌ Failed to launch dashboard:', error.message);
      
      if (this.config.autoRestart && this.restartCount < this.config.maxRestarts) {
        await this.attemptRestart();
      } else {
        process.exit(1);
      }
    }
  }

  setupErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error.message);
      if (this.config.autoRestart && this.restartCount < this.config.maxRestarts) {
        this.attemptRestart();
      } else {
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      if (this.config.autoRestart && this.restartCount < this.config.maxRestarts) {
        this.attemptRestart();
      } else {
        process.exit(1);
      }
    });

    // Handle SIGTERM
    process.on('SIGTERM', async () => {
      console.log('📡 SIGTERM received, shutting down gracefully...');
      await this.shutdown();
      process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      await this.shutdown();
      process.exit(0);
    });
  }

  async attemptRestart() {
    this.restartCount++;
    console.log(`🔄 Attempting restart ${this.restartCount}/${this.config.maxRestarts}...`);
    
    try {
      if (this.dashboard) {
        await this.dashboard.stop();
      }
    } catch (error) {
      console.warn('⚠️  Error stopping dashboard during restart:', error.message);
    }
    
    console.log(`⏳ Waiting ${this.config.restartDelay}ms before restart...`);
    await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
    
    try {
      await this.launch();
      this.restartCount = 0; // Reset on successful restart
    } catch (error) {
      console.error('❌ Restart failed:', error.message);
      
      if (this.restartCount >= this.config.maxRestarts) {
        console.error('❌ Maximum restart attempts reached, exiting...');
        process.exit(1);
      } else {
        await this.attemptRestart();
      }
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down monitoring dashboard...');
    
    try {
      if (this.dashboard) {
        await this.dashboard.stop();
        console.log('✅ Dashboard stopped successfully');
      }
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
    }
  }

  // Health check endpoint
  async healthCheck() {
    if (!this.dashboard) {
      return { status: 'stopped', uptime: 0 };
    }
    
    try {
      // This would typically make a request to the dashboard's health endpoint
      return {
        status: 'running',
        uptime: process.uptime(),
        port: this.config.port,
        environment: this.config.environment,
        restartCount: this.restartCount
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        uptime: process.uptime()
      };
    }
  }

  // Status report
  getStatus() {
    return {
      dashboard: this.dashboard ? 'running' : 'stopped',
      port: this.config.port,
      environment: this.config.environment,
      uptime: process.uptime(),
      restartCount: this.restartCount,
      pid: process.pid,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

// CLI handling
if (import.meta.url === `file://${process.argv[1]}`) {
  const launcher = new DashboardLauncher();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      launcher.launch();
      break;
      
    case 'status':
      console.log(JSON.stringify(launcher.getStatus(), null, 2));
      process.exit(0);
      break;
      
    case 'health':
      launcher.healthCheck().then(health => {
        console.log(JSON.stringify(health, null, 2));
        process.exit(health.status === 'running' ? 0 : 1);
      });
      break;
      
    default:
      // Default to start if no command specified
      launcher.launch();
      break;
  }
}

export default DashboardLauncher;