#!/usr/bin/env node

/**
 * Blaze Intelligence Server Management Script
 * Manages all server instances and environments
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import ProductionServerConfig from '../server-config.js';

const execAsync = promisify(exec);

class ServerManager {
  constructor() {
    this.serverConfig = new ProductionServerConfig();
    this.runningServers = new Map();
  }

  async listRunningServers() {
    try {
      const { stdout } = await execAsync('lsof -i :8080-8090 -t');
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      console.log('🔍 Scanning for running servers...');
      
      for (const pid of pids) {
        try {
          const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=,args=`);
          const portInfo = await execAsync(`lsof -p ${pid} -i -n | grep LISTEN`);
          console.log(`  PID ${pid}: ${processInfo.trim()}`);
          console.log(`    Ports: ${portInfo.stdout.trim()}`);
        } catch (e) {
          // Process might have ended
        }
      }
    } catch (error) {
      console.log('ℹ️  No servers found on ports 8080-8090');
    }
  }

  async checkServerHealth(port) {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}/api/health`);
      return stdout.trim() === '200';
    } catch (error) {
      return false;
    }
  }

  async startEnvironment(environment) {
    console.log(`🚀 Starting ${environment} environment...`);
    
    try {
      const server = await this.serverConfig.startServer(environment);
      const config = this.serverConfig.config.environments[environment];
      
      // Wait a moment for server to fully start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isHealthy = await this.checkServerHealth(config.port);
      
      if (isHealthy) {
        console.log(`✅ ${environment} server is healthy`);
        this.runningServers.set(environment, {
          port: config.port,
          server,
          status: 'healthy'
        });
      } else {
        console.log(`⚠️  ${environment} server started but health check failed`);
      }
      
      return server;
    } catch (error) {
      console.error(`❌ Failed to start ${environment}:`, error.message);
      throw error;
    }
  }

  async stopEnvironment(environment) {
    console.log(`🛑 Stopping ${environment} environment...`);
    
    try {
      await this.serverConfig.stopServer(environment);
      this.runningServers.delete(environment);
      console.log(`✅ ${environment} server stopped`);
    } catch (error) {
      console.error(`❌ Failed to stop ${environment}:`, error.message);
      throw error;
    }
  }

  async restartEnvironment(environment) {
    console.log(`🔄 Restarting ${environment} environment...`);
    
    if (this.runningServers.has(environment)) {
      await this.stopEnvironment(environment);
    }
    
    await this.startEnvironment(environment);
  }

  async stopAllServers() {
    console.log('🛑 Stopping all servers...');
    
    const environments = Array.from(this.runningServers.keys());
    for (const env of environments) {
      await this.stopEnvironment(env);
    }
  }

  async healthCheck() {
    console.log('🏥 Running health checks...');
    
    for (const [environment, info] of this.runningServers) {
      const isHealthy = await this.checkServerHealth(info.port);
      const status = isHealthy ? '✅ Healthy' : '❌ Unhealthy';
      console.log(`  ${environment} (port ${info.port}): ${status}`);
      
      if (isHealthy) {
        try {
          const { stdout } = await execAsync(`curl -s http://localhost:${info.port}/api/status`);
          const statusData = JSON.parse(stdout);
          console.log(`    Uptime: ${Math.round(statusData.uptime)}s`);
          console.log(`    Memory: ${Math.round(statusData.memory.rss / 1024 / 1024)}MB`);
        } catch (e) {
          console.log(`    Could not get detailed status`);
        }
      }
    }
  }

  getStatus() {
    console.log('📊 Server Status Summary');
    console.log('━'.repeat(50));
    
    const serverInfo = this.serverConfig.getServerInfo();
    console.log(`Current Environment: ${serverInfo.currentEnvironment}`);
    console.log(`Active Servers: ${this.runningServers.size}`);
    
    if (this.runningServers.size > 0) {
      console.log('\nRunning Servers:');
      for (const [env, info] of this.runningServers) {
        console.log(`  📍 ${env}: http://localhost:${info.port}`);
      }
    } else {
      console.log('\n⚪ No servers currently running');
    }
    
    console.log('\nAvailable Environments:');
    for (const [env, config] of Object.entries(serverInfo.config.environments)) {
      const isRunning = this.runningServers.has(env) ? '🟢' : '⚪';
      console.log(`  ${isRunning} ${env}: port ${config.port}`);
    }
  }

  async deploymentTest() {
    console.log('🧪 Running deployment test...');
    
    try {
      // Start staging environment
      await this.startEnvironment('staging');
      
      // Run basic tests
      const config = this.serverConfig.config.environments.staging;
      const tests = [
        { name: 'Health endpoint', url: `/api/health` },
        { name: 'Status endpoint', url: `/api/status` },
        { name: 'Static files', url: `/` }
      ];
      
      let passedTests = 0;
      for (const test of tests) {
        try {
          const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${config.port}${test.url}`);
          const success = stdout.trim() === '200';
          console.log(`  ${success ? '✅' : '❌'} ${test.name}: ${stdout.trim()}`);
          if (success) passedTests++;
        } catch (error) {
          console.log(`  ❌ ${test.name}: Failed`);
        }
      }
      
      console.log(`\n📊 Test Results: ${passedTests}/${tests.length} passed`);
      
      // Clean up
      await this.stopEnvironment('staging');
      
      return passedTests === tests.length;
    } catch (error) {
      console.error('❌ Deployment test failed:', error.message);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const manager = new ServerManager();
  const command = process.argv[2];
  const environment = process.argv[3];

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await manager.stopAllServers();
    process.exit(0);
  });

  try {
    switch (command) {
      case 'start':
        if (!environment) {
          console.error('❌ Environment required: development|staging|production');
          process.exit(1);
        }
        await manager.startEnvironment(environment);
        break;
        
      case 'stop':
        if (!environment) {
          await manager.stopAllServers();
        } else {
          await manager.stopEnvironment(environment);
        }
        break;
        
      case 'restart':
        if (!environment) {
          console.error('❌ Environment required: development|staging|production');
          process.exit(1);
        }
        await manager.restartEnvironment(environment);
        break;
        
      case 'status':
        manager.getStatus();
        break;
        
      case 'health':
        await manager.healthCheck();
        break;
        
      case 'list':
        await manager.listRunningServers();
        break;
        
      case 'test':
        const success = await manager.deploymentTest();
        process.exit(success ? 0 : 1);
        
      default:
        console.log('🔧 Blaze Intelligence Server Manager');
        console.log('');
        console.log('Usage:');
        console.log('  node manage-servers.js start <environment>   Start server');
        console.log('  node manage-servers.js stop [environment]    Stop server(s)');
        console.log('  node manage-servers.js restart <environment> Restart server');
        console.log('  node manage-servers.js status                Show status');
        console.log('  node manage-servers.js health                Check health');
        console.log('  node manage-servers.js list                  List running servers');
        console.log('  node manage-servers.js test                  Run deployment test');
        console.log('');
        console.log('Environments: development, staging, production');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ServerManager;