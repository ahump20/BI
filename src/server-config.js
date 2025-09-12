#!/usr/bin/env node

/**
 * Blaze Intelligence Production Server Configuration
 * Manages multiple server environments and port allocation
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import express from 'express';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import SecurityConfig from './config/security-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionServerConfig {
  constructor() {
    this.securityConfig = new SecurityConfig();
    this.config = {
      environments: {
        development: {
          port: 8090,
          staticPath: '.',
          cors: true,
          compression: false,
          ssl: false
        },
        staging: {
          port: 8091,
          staticPath: './austin-portfolio-deploy',
          cors: true,
          compression: true,
          ssl: false
        },
        production: {
          port: 8092,
          staticPath: './austin-portfolio-deploy',
          cors: false,
          compression: true,
          ssl: true
        }
      },
      services: {
        mcp: {
          name: 'Cardinals Analytics MCP',
          script: './cardinals-analytics-server.js',
          port: 'stdio'
        },
        biometric: {
          name: 'Biometric Analysis',
          path: '/api/biometric',
          enabled: true
        },
        analytics: {
          name: 'Sports Analytics',
          path: '/api/analytics',
          enabled: true
        }
      }
    };

    this.servers = new Map();
    this.currentEnvironment = process.env.NODE_ENV || 'development';
  }

  async startServer(environment = this.currentEnvironment) {
    const config = this.config.environments[environment];
    if (!config) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    console.log(`🚀 Starting Blaze Intelligence Server - ${environment.toUpperCase()}`);
    console.log(`📁 Static files: ${config.staticPath}`);
    console.log(`🌐 Port: ${config.port}`);

    const app = express();

    // Apply security middleware
    const securityMiddleware = this.securityConfig.getExpressMiddleware();
    securityMiddleware.forEach(middleware => app.use(middleware));

    // Basic compression middleware
    if (config.compression) {
      app.use((req, res, next) => {
        res.header('Content-Encoding', 'gzip');
        next();
      });
    }

    // Trust proxy for production
    if (environment === 'production') {
      app.set('trust proxy', 1);
    }

    // API routes
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        environment,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: Object.keys(this.config.services).filter(
          service => this.config.services[service].enabled
        )
      });
    });

    app.get('/api/status', (req, res) => {
      res.json({
        platform: 'Blaze Intelligence',
        environment,
        port: config.port,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        features: {
          biometrics: true,
          analytics: true,
          mcp: true,
          visionAI: true
        }
      });
    });

    // Static file serving
    if (existsSync(config.staticPath)) {
      app.use(express.static(config.staticPath));
      console.log(`📁 Serving static files from: ${path.resolve(config.staticPath)}`);
    } else {
      console.warn(`⚠️  Static path not found: ${config.staticPath}`);
    }

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        path: req.path,
        environment
      });
    });

    // Create server with SSL support if configured
    let server;
    const sslContext = this.securityConfig.getSSLContext();
    
    if (config.ssl && sslContext) {
      console.log('🔒 Creating HTTPS server with SSL');
      server = createHttpsServer({
        ...sslContext,
        ...config.sslOptions
      }, app);
    } else {
      console.log('🌐 Creating HTTP server');
      server = createServer(app);
    }

    return new Promise((resolve, reject) => {
      server.on('error', (err) => {
        reject(err);
      });
      
      server.listen(config.port, () => {
        console.log(`✅ Server running on http://localhost:${config.port}`);
        console.log(`🔧 Environment: ${environment}`);
        console.log(`🎯 Health check: http://localhost:${config.port}/api/health`);
        console.log(`📊 Status: http://localhost:${config.port}/api/status`);
        
        this.servers.set(environment, server);
        resolve(server);
      });
    });
  }

  async stopServer(environment) {
    const server = this.servers.get(environment);
    if (server) {
      return new Promise((resolve) => {
        server.close(() => {
          this.servers.delete(environment);
          console.log(`🛑 ${environment} server stopped`);
          resolve();
        });
      });
    }
  }

  async stopAllServers() {
    const environments = Array.from(this.servers.keys());
    for (const env of environments) {
      await this.stopServer(env);
    }
  }

  getServerInfo() {
    return {
      config: this.config,
      activeServers: Array.from(this.servers.keys()),
      currentEnvironment: this.currentEnvironment
    };
  }

  // Port availability checker
  async checkPortAvailable(port) {
    return new Promise((resolve) => {
      const server = createServer();
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      server.on('error', () => resolve(false));
    });
  }

  async findAvailablePort(startPort = 8080) {
    for (let port = startPort; port < startPort + 100; port++) {
      if (await this.checkPortAvailable(port)) {
        return port;
      }
    }
    throw new Error('No available ports found');
  }
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = new ProductionServerConfig();
  const environment = process.argv[2] || 'development';
  
  config.startServer(environment).catch(async (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${config.config.environments[environment].port} in use, finding alternative...`);
      const availablePort = await config.findAvailablePort();
      config.config.environments[environment].port = availablePort;
      return config.startServer(environment);
    }
    throw error;
  }).catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down servers...');
    await config.stopAllServers();
    process.exit(0);
  });
}

export default ProductionServerConfig;