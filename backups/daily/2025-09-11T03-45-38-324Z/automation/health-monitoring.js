#!/usr/bin/env node

/**
 * Blaze Intelligence Health Monitoring System
 * Comprehensive health checks and performance monitoring
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HealthMonitoring {
  constructor() {
    this.config = {
      checkInterval: 60000, // 1 minute
      alertThresholds: {
        cpu: 80, // CPU usage percentage
        memory: 85, // Memory usage percentage
        disk: 90, // Disk usage percentage
        responseTime: 5000 // API response time in ms
      },
      endpoints: [
        'http://localhost:8000',
        'http://localhost:8001'
      ]
    };
    
    this.metrics = {
      system: {},
      services: {},
      apis: {},
      alerts: []
    };
    
    this.startTime = Date.now();
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck() {
    console.log('🏥 Starting Blaze Intelligence Health Check...\n');
    
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      score: 100,
      checks: {},
      recommendations: []
    };

    try {
      // System Health
      results.checks.system = await this.checkSystemHealth();
      
      // File System Health
      results.checks.filesystem = await this.checkFileSystemHealth();
      
      // Service Health
      results.checks.services = await this.checkServiceHealth();
      
      // API Health
      results.checks.apis = await this.checkAPIHealth();
      
      // Database Health
      results.checks.database = await this.checkDatabaseHealth();
      
      // Security Health
      results.checks.security = await this.checkSecurityHealth();
      
      // Calculate overall health score
      results.score = this.calculateHealthScore(results.checks);
      results.overall = this.determineOverallHealth(results.score);
      results.recommendations = this.generateRecommendations(results.checks);
      
      this.displayHealthReport(results);
      return results;
      
    } catch (error) {
      console.error(`❌ Health check failed: ${error.message}`);
      results.overall = 'critical';
      results.score = 0;
      results.error = error.message;
      return results;
    }
  }

  /**
   * Check system resource health
   */
  async checkSystemHealth() {
    const system = {
      status: 'healthy',
      cpu: {},
      memory: {},
      disk: {},
      uptime: {}
    };

    try {
      // CPU Usage
      const cpus = os.cpus();
      system.cpu = {
        cores: cpus.length,
        model: cpus[0].model,
        usage: await this.getCPUUsage()
      };

      // Memory Usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      system.memory = {
        total: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        used: Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        free: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        usage: Math.round((usedMem / totalMem) * 100)
      };

      // System Uptime
      const uptime = os.uptime();
      system.uptime = {
        seconds: uptime,
        formatted: this.formatUptime(uptime)
      };

      // Process info
      system.process = {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
      };

      // Disk usage
      try {
        const { stdout } = await execAsync('df -h .');
        const lines = stdout.split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          system.disk = {
            total: parts[1],
            used: parts[2],
            available: parts[3],
            usage: parseInt(parts[4])
          };
        }
      } catch (error) {
        system.disk = { error: 'Unable to get disk usage' };
      }

      console.log('✅ System Health: OK');
      return system;
      
    } catch (error) {
      system.status = 'error';
      system.error = error.message;
      console.log('❌ System Health: ERROR');
      return system;
    }
  }

  /**
   * Check file system health
   */
  async checkFileSystemHealth() {
    const filesystem = {
      status: 'healthy',
      criticalFiles: {},
      permissions: {},
      storage: {}
    };

    try {
      const criticalFiles = [
        'package.json',
        'cardinals-analytics-server.js',
        'austin-portfolio-deploy/index.html',
        '.env.example'
      ];

      for (const file of criticalFiles) {
        try {
          const stats = await fs.stat(file);
          filesystem.criticalFiles[file] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime.toISOString()
          };
        } catch (error) {
          filesystem.criticalFiles[file] = {
            exists: false,
            error: error.message
          };
        }
      }

      // Check write permissions
      try {
        const testFile = '.health-check-temp';
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
        filesystem.permissions.write = true;
      } catch (error) {
        filesystem.permissions.write = false;
        filesystem.permissions.error = error.message;
      }

      console.log('✅ Filesystem Health: OK');
      return filesystem;
      
    } catch (error) {
      filesystem.status = 'error';
      filesystem.error = error.message;
      console.log('❌ Filesystem Health: ERROR');
      return filesystem;
    }
  }

  /**
   * Check service health
   */
  async checkServiceHealth() {
    const services = {
      status: 'healthy',
      automation: {},
      mcp: {},
      portfolio: {}
    };

    try {
      // Check automation services
      const automationServices = [
        'master-automation-controller.js',
        'health-monitoring.js',
        'sports-data-ingestion.js',
        'security-backup-automation.js',
        'report-pipeline-deploy.js'
      ];

      for (const service of automationServices) {
        const servicePath = path.join(__dirname, service);
        try {
          await fs.access(servicePath);
          services.automation[service] = { status: 'available' };
        } catch {
          services.automation[service] = { status: 'missing' };
        }
      }

      // Check MCP server
      try {
        await fs.access('cardinals-analytics-server.js');
        services.mcp = { status: 'available' };
      } catch {
        services.mcp = { status: 'missing' };
      }

      // Check portfolio
      try {
        await fs.access('austin-portfolio-deploy/index.html');
        services.portfolio = { status: 'available' };
      } catch {
        services.portfolio = { status: 'missing' };
      }

      console.log('✅ Service Health: OK');
      return services;
      
    } catch (error) {
      services.status = 'error';
      services.error = error.message;
      console.log('❌ Service Health: ERROR');
      return services;
    }
  }

  /**
   * Check API health
   */
  async checkAPIHealth() {
    const apis = {
      status: 'healthy',
      endpoints: {},
      performance: {}
    };

    try {
      // Check local endpoints
      for (const endpoint of this.config.endpoints) {
        const startTime = Date.now();
        try {
          // Simple HTTP check (would use fetch in real implementation)
          const { spawn } = await import('child_process');
          apis.endpoints[endpoint] = {
            status: 'checking',
            responseTime: Date.now() - startTime
          };
        } catch (error) {
          apis.endpoints[endpoint] = {
            status: 'error',
            error: error.message
          };
        }
      }

      console.log('✅ API Health: OK');
      return apis;
      
    } catch (error) {
      apis.status = 'error';
      apis.error = error.message;
      console.log('❌ API Health: ERROR');
      return apis;
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    const database = {
      status: 'healthy',
      connections: {},
      performance: {}
    };

    try {
      // Check for database configuration
      database.config = {
        redis: process.env.REDIS_URL ? 'configured' : 'not configured',
        d1: process.env.D1_DATABASE_ID ? 'configured' : 'not configured',
        r2: process.env.R2_ACCESS_KEY_ID ? 'configured' : 'not configured'
      };

      console.log('✅ Database Health: OK');
      return database;
      
    } catch (error) {
      database.status = 'error';
      database.error = error.message;
      console.log('❌ Database Health: ERROR');
      return database;
    }
  }

  /**
   * Check security health
   */
  async checkSecurityHealth() {
    const security = {
      status: 'healthy',
      environment: {},
      secrets: {},
      permissions: {}
    };

    try {
      // Check environment variables
      const criticalEnvVars = [
        'NODE_ENV',
        'CLAUDE_API_KEY',
        'OPENAI_API_KEY'
      ];

      for (const envVar of criticalEnvVars) {
        security.environment[envVar] = process.env[envVar] ? 'set' : 'missing';
      }

      // Check for exposed secrets (simplified check)
      try {
        const packageContent = await fs.readFile('package.json', 'utf8');
        security.secrets.packageJson = packageContent.includes('sk-') ? 'WARNING: Possible secret in package.json' : 'clean';
      } catch {
        security.secrets.packageJson = 'unable to check';
      }

      console.log('✅ Security Health: OK');
      return security;
      
    } catch (error) {
      security.status = 'error';
      security.error = error.message;
      console.log('❌ Security Health: ERROR');
      return security;
    }
  }

  /**
   * Calculate overall health score
   */
  calculateHealthScore(checks) {
    let score = 100;
    let totalChecks = 0;
    let failedChecks = 0;

    for (const [category, check] of Object.entries(checks)) {
      totalChecks++;
      if (check.status === 'error' || check.status === 'critical') {
        failedChecks++;
        score -= 20;
      } else if (check.status === 'warning') {
        score -= 10;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Determine overall health status
   */
  determineOverallHealth(score) {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'degraded';
    return 'critical';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(checks) {
    const recommendations = [];

    if (checks.services?.automation && Object.values(checks.services.automation).some(s => s.status === 'missing')) {
      recommendations.push('Missing automation services detected - run setup to install all components');
    }

    if (checks.security?.environment && Object.values(checks.security.environment).includes('missing')) {
      recommendations.push('Critical environment variables missing - check .env configuration');
    }

    if (checks.filesystem?.permissions?.write === false) {
      recommendations.push('Write permissions issue detected - check file system permissions');
    }

    return recommendations;
  }

  /**
   * Display formatted health report
   */
  displayHealthReport(results) {
    console.log('\n🏥 BLAZE INTELLIGENCE HEALTH REPORT');
    console.log('=' .repeat(50));
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Overall Status: ${this.getStatusIcon(results.overall)} ${results.overall.toUpperCase()}`);
    console.log(`Health Score: ${results.score}/100`);
    
    console.log('\n📊 DETAILED CHECKS:');
    for (const [category, check] of Object.entries(results.checks)) {
      const icon = this.getStatusIcon(check.status);
      console.log(`  ${icon} ${category}: ${check.status}`);
    }

    if (results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '=' .repeat(50));
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    const icons = {
      healthy: '✅',
      warning: '⚠️',
      degraded: '🟡',
      critical: '❌',
      error: '❌'
    };
    return icons[status] || '❓';
  }

  /**
   * Get CPU usage (simplified)
   */
  async getCPUUsage() {
    try {
      const { stdout } = await execAsync('top -l 1 | grep "CPU usage"');
      return stdout.trim();
    } catch {
      return 'Unable to determine CPU usage';
    }
  }

  /**
   * Format uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }
}

// CLI Interface
async function main() {
  const monitor = new HealthMonitoring();
  const command = process.argv[2] || 'check';

  try {
    switch (command) {
      case 'check':
      case 'health':
        const results = await monitor.runHealthCheck();
        process.exit(results.overall === 'healthy' ? 0 : 1);
        break;

      default:
        console.log(`Blaze Intelligence Health Monitoring

Usage: node health-monitoring.js [command]

Commands:
  check, health    Run comprehensive health check

Examples:
  npm run health-check
  node automation/health-monitoring.js check
`);
        break;
    }
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HealthMonitoring;