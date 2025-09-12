#!/usr/bin/env node

/**
 * Blaze Intelligence Security Configuration
 * SSL, security headers, and production hardening
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import { readFileSync, existsSync } from 'fs';
import { createSecureContext } from 'tls';
import path from 'path';

class SecurityConfig {
  constructor(environment = process.env.NODE_ENV || 'development') {
    this.environment = environment;
    this.config = this.loadSecurityConfig();
  }

  loadSecurityConfig() {
    const baseConfig = {
      // SSL/TLS Configuration
      ssl: {
        enabled: this.environment === 'production',
        key: process.env.BLAZE_SERVER_SSL_KEY_PATH || null,
        cert: process.env.BLAZE_SERVER_SSL_CERT_PATH || null,
        ca: process.env.BLAZE_SERVER_SSL_CA_PATH || null,
        protocols: ['TLSv1.2', 'TLSv1.3'],
        ciphers: [
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-SHA256',
          'ECDHE-RSA-AES256-SHA384'
        ].join(':'),
        honorCipherOrder: true,
        secureProtocol: 'TLSv1_2_method'
      },

      // Security Headers
      headers: {
        // Prevent XSS attacks
        contentSecurityPolicy: this.getCSPPolicy(),
        
        // Prevent clickjacking
        frameOptions: 'DENY',
        
        // Prevent MIME type sniffing
        noSniff: true,
        
        // Enable XSS protection
        xssProtection: '1; mode=block',
        
        // Force HTTPS
        strictTransportSecurity: this.environment === 'production' 
          ? 'max-age=31536000; includeSubDomains; preload'
          : null,
        
        // Referrer policy
        referrerPolicy: 'strict-origin-when-cross-origin',
        
        // Permissions policy
        permissionsPolicy: this.getPermissionsPolicy(),
        
        // Remove server signature
        removeServerHeader: true
      },

      // CORS Configuration
      cors: {
        enabled: this.environment !== 'production',
        origins: this.getAllowedOrigins(),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type', 
          'Authorization', 
          'X-Requested-With',
          'Accept',
          'Origin'
        ],
        credentials: true,
        maxAge: 86400 // 24 hours
      },

      // Rate Limiting
      rateLimiting: {
        enabled: true,
        windows: {
          api: { requests: 1000, window: 900 }, // 15 minutes
          auth: { requests: 5, window: 900 }, // 15 minutes
          upload: { requests: 10, window: 3600 }, // 1 hour
          general: { requests: 100, window: 900 } // 15 minutes
        },
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      },

      // Session Security
      session: {
        name: 'blaze_session',
        secret: process.env.SESSION_SECRET,
        cookie: {
          secure: this.environment === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: 'strict',
          path: '/'
        },
        rolling: true,
        resave: false,
        saveUninitialized: false
      },

      // API Security
      api: {
        keyRequired: this.environment === 'production',
        validateOrigin: true,
        maxPayloadSize: '10mb',
        timeout: 30000,
        rateLimitByIP: true,
        requireHttps: this.environment === 'production'
      }
    };

    return baseConfig;
  }

  getCSPPolicy() {
    const sources = {
      self: "'self'",
      data: "data:",
      blob: "blob:",
      unsafe_inline: "'unsafe-inline'",
      unsafe_eval: "'unsafe-eval'",
      none: "'none'"
    };

    if (this.environment === 'production') {
      return {
        'default-src': [sources.self],
        'script-src': [
          sources.self,
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
          "'sha256-HASH_OF_INLINE_SCRIPTS'"
        ],
        'style-src': [
          sources.self,
          sources.unsafe_inline,
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com'
        ],
        'img-src': [
          sources.self,
          sources.data,
          sources.blob,
          'https://*.blaze-intelligence.com',
          'https://images.unsplash.com'
        ],
        'font-src': [
          sources.self,
          'https://fonts.gstatic.com',
          'https://cdnjs.cloudflare.com'
        ],
        'connect-src': [
          sources.self,
          'https://api.blaze-intelligence.com',
          'wss://ws.blaze-intelligence.com',
          'https://statsapi.mlb.com',
          'https://site.api.espn.com'
        ],
        'frame-src': [sources.none],
        'object-src': [sources.none],
        'base-uri': [sources.self],
        'form-action': [sources.self],
        'frame-ancestors': [sources.none],
        'upgrade-insecure-requests': []
      };
    } else {
      // Development CSP - more permissive
      return {
        'default-src': [sources.self, sources.unsafe_inline, sources.unsafe_eval],
        'img-src': [sources.self, sources.data, sources.blob, '*'],
        'connect-src': [sources.self, '*'],
        'script-src': [sources.self, sources.unsafe_inline, sources.unsafe_eval, '*'],
        'style-src': [sources.self, sources.unsafe_inline, '*']
      };
    }
  }

  getPermissionsPolicy() {
    return [
      'camera=self',
      'microphone=self',
      'geolocation=self',
      'payment=self',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=self',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'fullscreen=self',
      'picture-in-picture=()'
    ].join(', ');
  }

  getAllowedOrigins() {
    if (this.environment === 'production') {
      return [
        'https://blaze-intelligence.com',
        'https://www.blaze-intelligence.com',
        'https://app.blaze-intelligence.com',
        'https://api.blaze-intelligence.com'
      ];
    } else {
      return [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8090',
        'http://localhost:8091',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8090'
      ];
    }
  }

  // Generate security middleware for Express
  getExpressMiddleware() {
    const middleware = [];

    // Security headers middleware
    middleware.push((req, res, next) => {
      const headers = this.config.headers;

      // Content Security Policy
      if (headers.contentSecurityPolicy) {
        const csp = Object.entries(headers.contentSecurityPolicy)
          .map(([directive, sources]) => {
            if (Array.isArray(sources)) {
              return `${directive} ${sources.join(' ')}`;
            }
            return `${directive}`;
          })
          .join('; ');
        res.setHeader('Content-Security-Policy', csp);
      }

      // Other security headers
      if (headers.frameOptions) {
        res.setHeader('X-Frame-Options', headers.frameOptions);
      }

      if (headers.noSniff) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }

      if (headers.xssProtection) {
        res.setHeader('X-XSS-Protection', headers.xssProtection);
      }

      if (headers.strictTransportSecurity && this.environment === 'production') {
        res.setHeader('Strict-Transport-Security', headers.strictTransportSecurity);
      }

      if (headers.referrerPolicy) {
        res.setHeader('Referrer-Policy', headers.referrerPolicy);
      }

      if (headers.permissionsPolicy) {
        res.setHeader('Permissions-Policy', headers.permissionsPolicy);
      }

      // Remove server header
      if (headers.removeServerHeader) {
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');
      }

      next();
    });

    // CORS middleware
    if (this.config.cors.enabled) {
      middleware.push((req, res, next) => {
        const origin = req.headers.origin;
        const allowedOrigins = this.config.cors.origins;

        if (allowedOrigins.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }

        res.setHeader('Access-Control-Allow-Methods', this.config.cors.methods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', this.config.cors.allowedHeaders.join(', '));
        
        if (this.config.cors.credentials) {
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        res.setHeader('Access-Control-Max-Age', this.config.cors.maxAge);

        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }

        next();
      });
    }

    return middleware;
  }

  // SSL Context for HTTPS server
  getSSLContext() {
    if (!this.config.ssl.enabled) {
      return null;
    }

    const { key, cert, ca } = this.config.ssl;

    if (!key || !cert || !existsSync(key) || !existsSync(cert)) {
      console.warn('⚠️  SSL certificates not found, falling back to HTTP');
      return null;
    }

    try {
      const options = {
        key: readFileSync(key),
        cert: readFileSync(cert),
        secureProtocol: this.config.ssl.secureProtocol,
        ciphers: this.config.ssl.ciphers,
        honorCipherOrder: this.config.ssl.honorCipherOrder
      };

      if (ca && existsSync(ca)) {
        options.ca = readFileSync(ca);
      }

      return createSecureContext(options);
    } catch (error) {
      console.error('❌ Failed to create SSL context:', error.message);
      return null;
    }
  }

  // Security audit
  auditSecurity() {
    const issues = [];
    const warnings = [];

    // Check SSL configuration
    if (this.environment === 'production' && !this.config.ssl.enabled) {
      issues.push('SSL not enabled in production');
    }

    // Check session secret
    if (!this.config.session.secret || this.config.session.secret.length < 32) {
      issues.push('Session secret is missing or too short');
    }

    // Check CORS configuration
    if (this.environment === 'production' && this.config.cors.enabled) {
      warnings.push('CORS is enabled in production - ensure origins are restricted');
    }

    // Check CSP
    const csp = this.config.headers.contentSecurityPolicy;
    if (csp && csp['script-src'] && csp['script-src'].includes("'unsafe-eval'")) {
      warnings.push('CSP allows unsafe-eval which may be a security risk');
    }

    return {
      issues,
      warnings,
      score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5))
    };
  }

  // Generate self-signed certificate for development
  generateDevCertificate() {
    // This would generate a self-signed certificate for development
    // In production, use proper certificates from Let's Encrypt or CA
    return {
      message: 'Use mkcert or openssl to generate development certificates',
      commands: [
        'mkcert localhost 127.0.0.1 ::1',
        'openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes'
      ]
    };
  }

  // Security report
  getSecurityReport() {
    const audit = this.auditSecurity();
    
    return {
      environment: this.environment,
      ssl: {
        enabled: this.config.ssl.enabled,
        protocols: this.config.ssl.protocols,
        cipherCount: this.config.ssl.ciphers.split(':').length
      },
      headers: {
        csp: !!this.config.headers.contentSecurityPolicy,
        hsts: !!this.config.headers.strictTransportSecurity,
        frameOptions: this.config.headers.frameOptions,
        xssProtection: this.config.headers.xssProtection
      },
      cors: {
        enabled: this.config.cors.enabled,
        originCount: this.config.cors.origins.length
      },
      rateLimiting: {
        enabled: this.config.rateLimiting.enabled,
        windowCount: Object.keys(this.config.rateLimiting.windows).length
      },
      session: {
        secure: this.config.session.cookie.secure,
        httpOnly: this.config.session.cookie.httpOnly,
        sameSite: this.config.session.cookie.sameSite
      },
      audit,
      recommendations: this.getSecurityRecommendations(audit)
    };
  }

  getSecurityRecommendations(audit) {
    const recommendations = [];

    if (audit.issues.length > 0) {
      recommendations.push('Address critical security issues immediately');
    }

    if (this.environment === 'production') {
      recommendations.push('Implement security monitoring and alerting');
      recommendations.push('Regular security audits and penetration testing');
      recommendations.push('Keep SSL certificates updated');
    }

    recommendations.push('Monitor security headers with tools like securityheaders.com');
    recommendations.push('Implement rate limiting based on usage patterns');
    recommendations.push('Regular security dependency updates');

    return recommendations;
  }
}

export default SecurityConfig;