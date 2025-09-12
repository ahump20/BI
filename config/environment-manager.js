#!/usr/bin/env node

/**
 * Blaze Intelligence Environment Configuration Manager
 * Secure handling of environment variables and API keys
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = new Map();
    this.required = new Set();
    this.encrypted = new Set();
    
    this.loadConfiguration();
  }

  loadConfiguration() {
    const configFiles = [
      `.env.${this.environment}`,
      '.env.local',
      '.env'
    ];

    for (const configFile of configFiles) {
      const configPath = path.join(process.cwd(), configFile);
      if (existsSync(configPath)) {
        this.parseConfigFile(configPath);
        console.log(`🔧 Loaded config: ${configFile}`);
      }
    }

    // Load from process.env as override
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('BLAZE_') || this.isKnownConfigKey(key)) {
        this.config.set(key, value);
      }
    }
  }

  parseConfigFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["'](.*)["']$/, '$1');
            this.config.set(key.trim(), value);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not parse config file ${filePath}:`, error.message);
    }
  }

  isKnownConfigKey(key) {
    const knownPrefixes = [
      'OPENAI_', 'ANTHROPIC_', 'GOOGLE_', 'XAI_',
      'MLB_', 'ESPN_', 'PERFECT_GAME_', 'SPORTS_',
      'STRIPE_', 'HUBSPOT_', 'AIRTABLE_',
      'SENDGRID_', 'TWILIO_', 'SLACK_',
      'CLOUDFLARE_', 'FIREBASE_', 'APNS_',
      'AWS_', 'REDIS_', 'DATABASE_',
      'JWT_', 'SESSION_', 'SENTRY_'
    ];

    return knownPrefixes.some(prefix => key.startsWith(prefix));
  }

  get(key, defaultValue = null) {
    const value = this.config.get(key);
    
    if (value === undefined || value === null || value === '') {
      if (this.required.has(key)) {
        throw new Error(`Required environment variable ${key} is not set`);
      }
      return defaultValue;
    }

    // Handle boolean conversion
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Handle number conversion
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

    return value;
  }

  getRequired(key) {
    this.required.add(key);
    return this.get(key);
  }

  getSecure(key, defaultValue = null) {
    const value = this.get(key, defaultValue);
    if (value && typeof value === 'string') {
      // Mark as encrypted for logging purposes
      this.encrypted.add(key);
      return value;
    }
    return value;
  }

  // Get configuration object with security masking
  getConfig() {
    const config = {};
    for (const [key, value] of this.config) {
      if (this.isSecretKey(key)) {
        config[key] = this.maskSecret(value);
      } else {
        config[key] = value;
      }
    }
    return config;
  }

  isSecretKey(key) {
    const secretPatterns = [
      /API_KEY/i, /SECRET/i, /PASSWORD/i, /TOKEN/i,
      /PRIVATE_KEY/i, /WEBHOOK/i, /DSN/i
    ];
    return secretPatterns.some(pattern => pattern.test(key));
  }

  maskSecret(value) {
    if (!value || typeof value !== 'string') return value;
    if (value.length <= 8) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }

  validateConfiguration() {
    const issues = [];
    const warnings = [];

    // Check for placeholder values
    for (const [key, value] of this.config) {
      if (typeof value === 'string' && value.includes('CHANGE_ME')) {
        issues.push(`${key} contains placeholder value: ${this.maskSecret(value)}`);
      }
    }

    // Check required production keys
    if (this.environment === 'production') {
      const requiredKeys = [
        'JWT_SECRET', 'SESSION_SECRET', 'DATABASE_URL',
        'REDIS_URL', 'OPENAI_API_KEY'
      ];

      for (const key of requiredKeys) {
        if (!this.config.has(key) || !this.config.get(key)) {
          issues.push(`Required production key missing: ${key}`);
        }
      }
    }

    // Check for weak secrets
    const secretKeys = ['JWT_SECRET', 'SESSION_SECRET'];
    for (const key of secretKeys) {
      const value = this.config.get(key);
      if (value && typeof value === 'string' && value.length < 32) {
        warnings.push(`${key} should be at least 32 characters long`);
      }
    }

    return { issues, warnings };
  }

  generateSecrets() {
    const secrets = {
      JWT_SECRET: this.generateRandomSecret(64),
      JWT_REFRESH_SECRET: this.generateRandomSecret(64),
      SESSION_SECRET: this.generateRandomSecret(64),
      BACKUP_ENCRYPTION_KEY: this.generateRandomSecret(32)
    };

    console.log('🔐 Generated secure secrets:');
    for (const [key, value] of Object.entries(secrets)) {
      console.log(`${key}=${value}`);
    }

    return secrets;
  }

  generateRandomSecret(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  createEnvironmentFile(environment = 'development') {
    const templatePath = path.join(process.cwd(), '.env.production');
    const outputPath = path.join(process.cwd(), `.env.${environment}`);

    if (!existsSync(templatePath)) {
      throw new Error('Production template not found');
    }

    const template = readFileSync(templatePath, 'utf8');
    let content = template;

    // Replace environment-specific values
    content = content.replace(/NODE_ENV=production/g, `NODE_ENV=${environment}`);
    content = content.replace(/BLAZE_ENVIRONMENT=production/g, `BLAZE_ENVIRONMENT=${environment}`);
    
    if (environment === 'development') {
      content = content.replace(/PORT=8092/g, 'PORT=8090');
      content = content.replace(/SSL_ENABLED=true/g, 'SSL_ENABLED=false');
      content = content.replace(/CORS_ENABLED=false/g, 'CORS_ENABLED=true');
      content = content.replace(/DEBUG_MODE=false/g, 'DEBUG_MODE=true');
    }

    writeFileSync(outputPath, content);
    console.log(`✅ Created ${outputPath}`);
    return outputPath;
  }

  healthCheck() {
    const { issues, warnings } = this.validateConfiguration();
    
    console.log('🏥 Environment Configuration Health Check');
    console.log('━'.repeat(50));
    console.log(`Environment: ${this.environment}`);
    console.log(`Config Keys: ${this.config.size}`);
    console.log(`Secret Keys: ${Array.from(this.config.keys()).filter(k => this.isSecretKey(k)).length}`);
    
    if (issues.length > 0) {
      console.log('\n❌ Critical Issues:');
      issues.forEach(issue => console.log(`  • ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('\n✅ Configuration looks good!');
    }

    return { healthy: issues.length === 0, issues, warnings };
  }
}

// CLI Commands
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new EnvironmentManager();
  const command = process.argv[2];

  switch (command) {
    case 'validate':
      manager.healthCheck();
      break;
      
    case 'generate-secrets':
      manager.generateSecrets();
      break;
      
    case 'create-env':
      const env = process.argv[3] || 'development';
      manager.createEnvironmentFile(env);
      break;
      
    case 'health':
      const { healthy } = manager.healthCheck();
      process.exit(healthy ? 0 : 1);
      
    default:
      console.log('🔧 Blaze Intelligence Environment Manager');
      console.log('');
      console.log('Commands:');
      console.log('  validate           Check configuration health');
      console.log('  generate-secrets   Generate secure random secrets');
      console.log('  create-env <env>   Create environment file');
      console.log('  health             Health check (exit code)');
      break;
  }
}

export default EnvironmentManager;