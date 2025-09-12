#!/usr/bin/env node

/**
 * Blaze Intelligence Security & Backup Automation System
 * Comprehensive security scanning and automated backup operations
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityBackupAutomation {
  constructor() {
    this.config = {
      backupDir: path.join(process.cwd(), 'backups'),
      securityLogDir: path.join(process.cwd(), 'logs', 'security'),
      backupRetention: 30, // days
      scanSchedule: '0 2 * * *', // Daily at 2 AM
      criticalPaths: [
        'package.json',
        'package-lock.json',
        '.env.example',
        'cardinals-analytics-server.js',
        'austin-portfolio-deploy/',
        'automation/',
        'data/',
        'scripts/'
      ]
    };

    this.securityPatterns = {
      apiKeys: [
        /sk-[a-zA-Z0-9]{32,}/g, // OpenAI API keys
        /pk_[a-zA-Z0-9]{24,}/g, // Stripe public keys
        /sk_[a-zA-Z0-9]{24,}/g, // Stripe secret keys
        /ghp_[a-zA-Z0-9]{36}/g, // GitHub personal access tokens
        /xai-[a-zA-Z0-9]{32,}/g, // xAI API keys
        /AIzaSy[a-zA-Z0-9_-]{33}/g, // Google API keys
        /AKIA[0-9A-Z]{16}/g, // AWS access keys
        /[a-zA-Z0-9+/]{40}/g // Generic base64 tokens
      ],
      secrets: [
        /password\s*[:=]\s*['"](.*?)['"]$/gi,
        /secret\s*[:=]\s*['"](.*?)['"]$/gi,
        /token\s*[:=]\s*['"](.*?)['"]$/gi,
        /key\s*[:=]\s*['"](.*?)['"]$/gi
      ],
      sensitiveFiles: [
        /\.env$/,
        /\.key$/,
        /\.pem$/,
        /\.p12$/,
        /\.pfx$/,
        /id_rsa$/,
        /id_dsa$/
      ]
    };

    this.logs = [];
    this.lastBackup = null;
    this.lastScan = null;
    this.metrics = {
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      totalScans: 0,
      threatsDetected: 0,
      issuesResolved: 0
    };
  }

  /**
   * Initialize security and backup system
   */
  async initialize() {
    this.log('info', 'Initializing Security & Backup Automation System');
    
    try {
      await this.createDirectories();
      await this.loadConfiguration();
      await this.validatePermissions();
      
      this.log('info', 'Security & Backup system initialized successfully');
      return { success: true, message: 'System initialized' };
    } catch (error) {
      this.log('error', `Initialization failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create necessary directories
   */
  async createDirectories() {
    const directories = [
      this.config.backupDir,
      this.config.securityLogDir,
      path.join(this.config.backupDir, 'daily'),
      path.join(this.config.backupDir, 'weekly'),
      path.join(this.config.backupDir, 'emergency')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        this.log('debug', `✅ Directory created/verified: ${dir}`);
      } catch (error) {
        this.log('warn', `⚠️  Could not create directory ${dir}: ${error.message}`);
      }
    }
  }

  /**
   * Load security configuration
   */
  async loadConfiguration() {
    try {
      const configPath = path.join(this.config.securityLogDir, 'security-config.json');
      
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        this.config = { ...this.config, ...config };
        this.log('info', '✅ Security configuration loaded');
      } catch {
        // Create default configuration
        const defaultConfig = {
          lastScan: null,
          scanInterval: 86400000, // 24 hours
          alertThresholds: {
            criticalVulnerabilities: 0,
            highVulnerabilities: 5,
            secretsDetected: 0
          },
          notifications: {
            email: false,
            slack: false
          }
        };
        
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
        this.log('info', '✅ Default security configuration created');
      }
    } catch (error) {
      this.log('warn', `⚠️  Security configuration loading failed: ${error.message}`);
    }
  }

  /**
   * Validate system permissions
   */
  async validatePermissions() {
    try {
      // Test write permissions in backup directory
      const testFile = path.join(this.config.backupDir, '.permission-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      this.log('info', '✅ Permissions validated');
    } catch (error) {
      this.log('error', `❌ Permission validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run comprehensive security scan
   */
  async runSecurityScan() {
    this.log('info', '🔒 Starting comprehensive security scan...');
    
    const startTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      duration: 0,
      overall: 'secure',
      scans: {},
      threats: [],
      recommendations: []
    };

    try {
      // Scan for exposed secrets
      results.scans.secrets = await this.scanForSecrets();
      
      // Scan for vulnerable dependencies
      results.scans.dependencies = await this.scanDependencies();
      
      // Scan for sensitive files
      results.scans.sensitiveFiles = await this.scanSensitiveFiles();
      
      // Check file permissions
      results.scans.permissions = await this.checkFilePermissions();
      
      // Check environment security
      results.scans.environment = await this.checkEnvironmentSecurity();
      
      // Consolidate threats
      results.threats = this.consolidateThreats(results.scans);
      results.recommendations = this.generateSecurityRecommendations(results.scans);
      
      // Determine overall security status
      results.overall = this.determineSecurityStatus(results.threats);
      
      results.duration = Date.now() - startTime;
      this.lastScan = new Date();
      this.metrics.totalScans++;
      this.metrics.threatsDetected += results.threats.length;

      // Save scan results
      await this.saveScanResults(results);
      
      this.log('info', `🎯 Security scan completed in ${results.duration}ms - Status: ${results.overall}`);
      return results;
      
    } catch (error) {
      results.duration = Date.now() - startTime;
      results.overall = 'error';
      results.error = error.message;
      
      this.log('error', `❌ Security scan failed: ${error.message}`);
      return results;
    }
  }

  /**
   * Scan for exposed secrets
   */
  async scanForSecrets() {
    const secrets = {
      status: 'clean',
      findings: [],
      filesScanned: 0
    };

    try {
      const filesToScan = await this.getFilesToScan(['.js', '.ts', '.json', '.md', '.txt']);
      
      for (const filePath of filesToScan) {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          secrets.filesScanned++;
          
          // Check for API key patterns
          for (const pattern of this.securityPatterns.apiKeys) {
            const matches = content.match(pattern);
            if (matches) {
              secrets.findings.push({
                type: 'api_key',
                file: filePath,
                matches: matches.length,
                severity: 'critical'
              });
            }
          }
          
          // Check for secret patterns
          for (const pattern of this.securityPatterns.secrets) {
            const matches = content.match(pattern);
            if (matches) {
              secrets.findings.push({
                type: 'secret',
                file: filePath,
                matches: matches.length,
                severity: 'high'
              });
            }
          }
          
        } catch (error) {
          this.log('debug', `Could not scan ${filePath}: ${error.message}`);
        }
      }
      
      if (secrets.findings.length > 0) {
        secrets.status = 'threats_detected';
      }
      
      this.log('info', `✅ Secret scan completed - ${secrets.filesScanned} files scanned, ${secrets.findings.length} issues found`);
      return secrets;
      
    } catch (error) {
      secrets.status = 'error';
      secrets.error = error.message;
      return secrets;
    }
  }

  /**
   * Scan for vulnerable dependencies
   */
  async scanDependencies() {
    const dependencies = {
      status: 'secure',
      vulnerabilities: [],
      total: 0,
      outdated: 0
    };

    try {
      // Check if package.json exists
      const packagePath = path.join(process.cwd(), 'package.json');
      try {
        const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };
        dependencies.total = Object.keys(deps).length;
        
        // Simple dependency check (in production, would use npm audit)
        const outdatedPackages = [];
        for (const [pkg, version] of Object.entries(deps)) {
          if (version.startsWith('^') || version.startsWith('~')) {
            // Package allows updates
          } else {
            outdatedPackages.push(pkg);
          }
        }
        
        dependencies.outdated = outdatedPackages.length;
        
        this.log('info', `✅ Dependency scan completed - ${dependencies.total} dependencies, ${dependencies.outdated} potentially outdated`);
        
      } catch (error) {
        dependencies.status = 'error';
        dependencies.error = 'package.json not found or invalid';
      }
      
      return dependencies;
      
    } catch (error) {
      dependencies.status = 'error';
      dependencies.error = error.message;
      return dependencies;
    }
  }

  /**
   * Scan for sensitive files
   */
  async scanSensitiveFiles() {
    const sensitiveFiles = {
      status: 'secure',
      findings: [],
      total: 0
    };

    try {
      const allFiles = await this.getAllFiles();
      
      for (const filePath of allFiles) {
        const filename = path.basename(filePath);
        
        for (const pattern of this.securityPatterns.sensitiveFiles) {
          if (pattern.test(filename)) {
            sensitiveFiles.findings.push({
              file: filePath,
              type: 'sensitive_file',
              severity: 'medium'
            });
          }
        }
      }
      
      sensitiveFiles.total = allFiles.length;
      
      if (sensitiveFiles.findings.length > 0) {
        sensitiveFiles.status = 'issues_found';
      }
      
      this.log('info', `✅ Sensitive file scan completed - ${sensitiveFiles.total} files scanned, ${sensitiveFiles.findings.length} sensitive files found`);
      return sensitiveFiles;
      
    } catch (error) {
      sensitiveFiles.status = 'error';
      sensitiveFiles.error = error.message;
      return sensitiveFiles;
    }
  }

  /**
   * Check file permissions
   */
  async checkFilePermissions() {
    const permissions = {
      status: 'secure',
      issues: [],
      checked: 0
    };

    try {
      for (const criticalPath of this.config.criticalPaths) {
        try {
          const stats = await fs.stat(criticalPath);
          permissions.checked++;
          
          // Check if file is world-writable
          if (stats.mode & parseInt('002', 8)) {
            permissions.issues.push({
              file: criticalPath,
              issue: 'world_writable',
              severity: 'high'
            });
          }
          
        } catch (error) {
          permissions.issues.push({
            file: criticalPath,
            issue: 'not_found',
            severity: 'medium'
          });
        }
      }
      
      if (permissions.issues.length > 0) {
        permissions.status = 'issues_found';
      }
      
      this.log('info', `✅ Permission check completed - ${permissions.checked} items checked, ${permissions.issues.length} issues found`);
      return permissions;
      
    } catch (error) {
      permissions.status = 'error';
      permissions.error = error.message;
      return permissions;
    }
  }

  /**
   * Check environment security
   */
  async checkEnvironmentSecurity() {
    const environment = {
      status: 'secure',
      issues: [],
      checks: 0
    };

    try {
      // Check for production environment settings
      if (process.env.NODE_ENV !== 'production') {
        environment.issues.push({
          type: 'environment',
          issue: 'not_production_mode',
          severity: 'low'
        });
      }
      environment.checks++;
      
      // Check for debug settings
      if (process.env.DEBUG) {
        environment.issues.push({
          type: 'environment',
          issue: 'debug_enabled',
          severity: 'medium'
        });
      }
      environment.checks++;
      
      // Check for development dependencies in production
      if (process.env.NODE_ENV === 'production') {
        try {
          const packageData = JSON.parse(await fs.readFile('package.json', 'utf8'));
          if (packageData.devDependencies && Object.keys(packageData.devDependencies).length > 0) {
            environment.issues.push({
              type: 'dependencies',
              issue: 'dev_dependencies_in_production',
              severity: 'medium'
            });
          }
        } catch {
          // Ignore if package.json not found
        }
      }
      environment.checks++;
      
      if (environment.issues.length > 0) {
        environment.status = 'issues_found';
      }
      
      this.log('info', `✅ Environment security check completed - ${environment.checks} checks, ${environment.issues.length} issues found`);
      return environment;
      
    } catch (error) {
      environment.status = 'error';
      environment.error = error.message;
      return environment;
    }
  }

  /**
   * Execute comprehensive backup
   */
  async executeBackup() {
    this.log('info', '💾 Starting comprehensive backup...');
    
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.config.backupDir, 'daily', timestamp);
    
    const results = {
      timestamp: new Date().toISOString(),
      duration: 0,
      location: backupDir,
      files: [],
      success: true,
      size: 0
    };

    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      // Backup critical paths
      for (const criticalPath of this.config.criticalPaths) {
        try {
          const stats = await fs.stat(criticalPath);
          const destPath = path.join(backupDir, path.basename(criticalPath));
          
          if (stats.isDirectory()) {
            // Copy directory recursively
            await execAsync(`cp -r "${criticalPath}" "${destPath}"`);
          } else {
            // Copy file
            await fs.copyFile(criticalPath, destPath);
          }
          
          results.files.push({
            source: criticalPath,
            destination: destPath,
            size: stats.size
          });
          
          results.size += stats.size;
          
          this.log('debug', `✅ Backed up: ${criticalPath}`);
          
        } catch (error) {
          this.log('warn', `⚠️  Could not backup ${criticalPath}: ${error.message}`);
          results.files.push({
            source: criticalPath,
            error: error.message
          });
        }
      }
      
      // Create backup manifest
      const manifest = {
        timestamp: results.timestamp,
        files: results.files,
        totalSize: results.size,
        systemInfo: {
          platform: process.platform,
          nodeVersion: process.version,
          hostname: require('os').hostname()
        }
      };
      
      await fs.writeFile(
        path.join(backupDir, 'backup-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
      results.duration = Date.now() - startTime;
      this.lastBackup = new Date();
      this.metrics.totalBackups++;
      this.metrics.successfulBackups++;
      
      this.log('info', `🎯 Backup completed in ${results.duration}ms - ${results.files.length} items, ${(results.size / 1024 / 1024).toFixed(2)} MB`);
      return results;
      
    } catch (error) {
      results.duration = Date.now() - startTime;
      results.success = false;
      results.error = error.message;
      
      this.metrics.totalBackups++;
      this.metrics.failedBackups++;
      
      this.log('error', `❌ Backup failed: ${error.message}`);
      return results;
    }
  }

  /**
   * Get list of files to scan
   */
  async getFilesToScan(extensions) {
    const files = [];
    
    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // Skip node_modules and other ignore directories
            if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    }
    
    await scanDirectory(process.cwd());
    return files;
  }

  /**
   * Get all files in project
   */
  async getAllFiles() {
    const files = [];
    
    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!['node_modules', '.git'].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    }
    
    await scanDirectory(process.cwd());
    return files;
  }

  /**
   * Consolidate threats from all scans
   */
  consolidateThreats(scans) {
    const threats = [];
    
    for (const [scanType, scanResult] of Object.entries(scans)) {
      if (scanResult.findings) {
        threats.push(...scanResult.findings.map(finding => ({
          ...finding,
          scanType
        })));
      }
      
      if (scanResult.issues) {
        threats.push(...scanResult.issues.map(issue => ({
          ...issue,
          scanType
        })));
      }
    }
    
    return threats;
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations(scans) {
    const recommendations = [];
    
    if (scans.secrets?.findings?.length > 0) {
      recommendations.push('🔑 Remove all exposed API keys and secrets from code');
      recommendations.push('🔐 Use environment variables for all sensitive configuration');
    }
    
    if (scans.sensitiveFiles?.findings?.length > 0) {
      recommendations.push('📁 Review sensitive files and ensure they are not committed to version control');
    }
    
    if (scans.permissions?.issues?.length > 0) {
      recommendations.push('🔒 Fix file permission issues to prevent unauthorized access');
    }
    
    if (scans.dependencies?.outdated > 0) {
      recommendations.push('📦 Update outdated dependencies to latest secure versions');
    }
    
    return recommendations;
  }

  /**
   * Determine overall security status
   */
  determineSecurityStatus(threats) {
    const criticalThreats = threats.filter(t => t.severity === 'critical').length;
    const highThreats = threats.filter(t => t.severity === 'high').length;
    
    if (criticalThreats > 0) return 'critical';
    if (highThreats > 0) return 'high_risk';
    if (threats.length > 0) return 'medium_risk';
    return 'secure';
  }

  /**
   * Save scan results
   */
  async saveScanResults(results) {
    try {
      const filename = `security-scan-${Date.now()}.json`;
      const filepath = path.join(this.config.securityLogDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(results, null, 2));
      
      // Also save as latest
      const latestPath = path.join(this.config.securityLogDir, 'latest-scan.json');
      await fs.writeFile(latestPath, JSON.stringify(results, null, 2));
      
      this.log('debug', `✅ Scan results saved: ${filepath}`);
    } catch (error) {
      this.log('error', `❌ Failed to save scan results: ${error.message}`);
    }
  }

  /**
   * Cleanup old backups
   */
  async cleanupOldBackups() {
    try {
      const dailyBackupDir = path.join(this.config.backupDir, 'daily');
      const entries = await fs.readdir(dailyBackupDir, { withFileTypes: true });
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.backupRetention);
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const backupDate = new Date(entry.name);
          if (backupDate < cutoffDate) {
            const backupPath = path.join(dailyBackupDir, entry.name);
            await execAsync(`rm -rf "${backupPath}"`);
            this.log('debug', `🗑️  Cleaned up old backup: ${entry.name}`);
          }
        }
      }
    } catch (error) {
      this.log('warn', `⚠️  Backup cleanup failed: ${error.message}`);
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      lastBackup: this.lastBackup,
      lastScan: this.lastScan,
      metrics: this.metrics,
      config: {
        backupRetention: this.config.backupRetention,
        scanSchedule: this.config.scanSchedule
      },
      logs: this.logs.slice(-10)
    };
  }

  /**
   * Logging system
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    this.logs.push(logEntry);
    
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[90m',
      reset: '\x1b[0m'
    };
    
    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] SECURITY ${level.toUpperCase()}: ${message}${colors.reset}`);
  }
}

// CLI Interface
async function main() {
  const security = new SecurityBackupAutomation();
  const command = process.argv[2] || 'scan';

  try {
    await security.initialize();

    switch (command) {
      case 'scan':
        const scanResults = await security.runSecurityScan();
        console.log(JSON.stringify(scanResults, null, 2));
        process.exit(scanResults.overall === 'secure' ? 0 : 1);
        break;

      case 'backup':
        const backupResults = await security.executeBackup();
        console.log(JSON.stringify(backupResults, null, 2));
        process.exit(backupResults.success ? 0 : 1);
        break;

      case 'status':
        const status = await security.getSystemStatus();
        console.log(JSON.stringify(status, null, 2));
        break;

      default:
        console.log(`Blaze Intelligence Security & Backup Automation

Usage: node security-backup-automation.js [command]

Commands:
  scan      Run comprehensive security scan
  backup    Execute comprehensive backup
  status    Show system status

Examples:
  npm run security-scan
  npm run backup
  node automation/security-backup-automation.js scan
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

export default SecurityBackupAutomation;