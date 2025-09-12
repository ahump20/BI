#!/usr/bin/env node

/**
 * Blaze Intelligence Master Automation Controller
 * Central orchestration system for all automated operations
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MasterAutomationController {
  constructor() {
    this.config = {
      logLevel: process.env.LOG_LEVEL || 'info',
      environment: process.env.NODE_ENV || 'development',
      healthCheckInterval: 300000, // 5 minutes
      backupInterval: 3600000, // 1 hour
      dataIngestionInterval: 600000, // 10 minutes
    };
    
    this.services = {
      healthMonitoring: false,
      dataIngestion: false,
      securityScanning: false,
      reportGeneration: false,
      mcpServer: false
    };
    
    this.logs = [];
    this.startTime = new Date();
  }

  /**
   * Initialize the master controller
   */
  async initialize() {
    this.log('info', 'Initializing Blaze Intelligence Master Automation Controller');
    
    try {
      await this.checkDependencies();
      await this.loadConfiguration();
      await this.startServices();
      
      this.log('info', 'Master Automation Controller initialized successfully');
      return { success: true, message: 'Controller initialized' };
    } catch (error) {
      this.log('error', `Initialization failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check system dependencies
   */
  async checkDependencies() {
    this.log('info', 'Checking system dependencies...');
    
    const requiredCommands = ['node', 'npm', 'python3'];
    
    for (const cmd of requiredCommands) {
      try {
        await execAsync(`which ${cmd}`);
        this.log('debug', `✅ ${cmd} available`);
      } catch (error) {
        throw new Error(`Required command not found: ${cmd}`);
      }
    }
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
    }
    
    this.log('info', `Node.js ${nodeVersion} ✅`);
  }

  /**
   * Load system configuration
   */
  async loadConfiguration() {
    this.log('info', 'Loading system configuration...');
    
    try {
      // Check for .env file
      const envPath = path.join(process.cwd(), '.env');
      try {
        await fs.access(envPath);
        this.log('info', '✅ Environment configuration found');
      } catch {
        this.log('warn', '⚠️  No .env file found, using defaults');
      }
      
      // Load package.json
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      
      this.config.version = packageData.version;
      this.config.name = packageData.name;
      
      this.log('info', `Loaded ${this.config.name} v${this.config.version}`);
      
    } catch (error) {
      throw new Error(`Configuration loading failed: ${error.message}`);
    }
  }

  /**
   * Start all automation services
   */
  async startServices() {
    this.log('info', 'Starting automation services...');
    
    // Check service availability
    await this.checkServiceHealth();
    
    this.log('info', 'All services checked and ready');
  }

  /**
   * Check health of all services
   */
  async checkServiceHealth() {
    const services = [
      { name: 'healthMonitoring', path: './health-monitoring.js' },
      { name: 'dataIngestion', path: './sports-data-ingestion.js' },
      { name: 'securityScanning', path: './security-backup-automation.js' },
      { name: 'reportGeneration', path: './report-pipeline-deploy.js' }
    ];

    for (const service of services) {
      try {
        const servicePath = path.join(__dirname, service.path);
        await fs.access(servicePath);
        this.services[service.name] = true;
        this.log('debug', `✅ ${service.name} service available`);
      } catch {
        this.services[service.name] = false;
        this.log('warn', `⚠️  ${service.name} service not found at ${service.path}`);
      }
    }

    // Check MCP server
    try {
      const mcpPath = path.join(process.cwd(), 'cardinals-analytics-server.js');
      await fs.access(mcpPath);
      this.services.mcpServer = true;
      this.log('debug', '✅ MCP server available');
    } catch {
      this.services.mcpServer = false;
      this.log('warn', '⚠️  MCP server not found');
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    await this.checkServiceHealth();
    
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    const memoryUsage = process.memoryUsage();
    
    return {
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
      environment: this.config.environment,
      version: this.config.version,
      services: this.services,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
      },
      logs: this.logs.slice(-10) // Last 10 log entries
    };
  }

  /**
   * Run health check on all systems
   */
  async runHealthCheck() {
    this.log('info', 'Running comprehensive health check...');
    
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {}
    };

    // Check file system access
    try {
      const testFile = path.join(process.cwd(), '.health-check-temp');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      results.checks.filesystem = 'healthy';
    } catch (error) {
      results.checks.filesystem = 'error';
      results.overall = 'unhealthy';
    }

    // Check port availability
    try {
      const { spawn } = await import('child_process');
      const netstat = spawn('netstat', ['-an']);
      results.checks.network = 'healthy';
    } catch (error) {
      results.checks.network = 'warning';
    }

    // Check services
    results.checks.services = this.services;
    
    // Determine overall health
    const serviceHealth = Object.values(this.services);
    const criticalServicesDown = serviceHealth.filter(status => !status).length;
    
    if (criticalServicesDown > 2) {
      results.overall = 'unhealthy';
    } else if (criticalServicesDown > 0) {
      results.overall = 'degraded';
    }

    this.log('info', `Health check completed - Status: ${results.overall}`);
    return results;
  }

  /**
   * Execute emergency backup
   */
  async executeBackup() {
    this.log('info', 'Executing emergency backup...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups', timestamp);
      
      await fs.mkdir(backupDir, { recursive: true });
      
      // Backup critical files
      const criticalFiles = [
        'package.json',
        'package-lock.json',
        'cardinals-analytics-server.js',
        'dynamic-content-updater.js'
      ];

      for (const file of criticalFiles) {
        try {
          const source = path.join(process.cwd(), file);
          const dest = path.join(backupDir, file);
          await fs.copyFile(source, dest);
          this.log('debug', `✅ Backed up ${file}`);
        } catch (error) {
          this.log('warn', `⚠️  Could not backup ${file}: ${error.message}`);
        }
      }

      // Backup austin-portfolio-deploy directory
      try {
        await execAsync(`cp -r austin-portfolio-deploy "${backupDir}/"`);
        this.log('info', '✅ Portfolio backup completed');
      } catch (error) {
        this.log('warn', `⚠️  Portfolio backup failed: ${error.message}`);
      }

      this.log('info', `Backup completed: ${backupDir}`);
      return { success: true, location: backupDir };
      
    } catch (error) {
      this.log('error', `Backup failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logging system
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[90m',
      reset: '\x1b[0m'
    };
    
    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
  }
}

// CLI Interface
async function main() {
  const controller = new MasterAutomationController();
  const command = process.argv[2] || 'status';

  try {
    switch (command) {
      case 'init':
      case 'initialize':
        const initResult = await controller.initialize();
        console.log(JSON.stringify(initResult, null, 2));
        process.exit(initResult.success ? 0 : 1);
        break;

      case 'status':
        await controller.initialize();
        const status = await controller.getSystemStatus();
        console.log(JSON.stringify(status, null, 2));
        break;

      case 'health':
      case 'health-check':
        await controller.initialize();
        const health = await controller.runHealthCheck();
        console.log(JSON.stringify(health, null, 2));
        process.exit(health.overall === 'healthy' ? 0 : 1);
        break;

      case 'backup':
        await controller.initialize();
        const backup = await controller.executeBackup();
        console.log(JSON.stringify(backup, null, 2));
        process.exit(backup.success ? 0 : 1);
        break;

      default:
        console.log(`Blaze Intelligence Master Automation Controller

Usage: node master-automation-controller.js [command]

Commands:
  init, initialize  Initialize the automation system
  status           Show comprehensive system status
  health           Run health check on all systems
  backup           Execute emergency backup

Examples:
  npm run status
  npm run health-check
  npm run backup
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

export default MasterAutomationController;