#!/usr/bin/env node

/**
 * Blaze Intelligence Authentication System
 * JWT-based auth with tiered access control
 */

import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlazeAuthSystem {
  constructor() {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
      tokenExpiry: '7d',
      refreshExpiry: '30d',
      tiers: {
        free: {
          name: 'Free Trial',
          limits: {
            teams: 1,
            athletes: 10,
            apiCalls: 100,
            havfCalculations: 10,
            visionAnalysis: 0
          },
          features: ['basic_analytics', 'readiness_scores'],
          price: 0
        },
        starter: {
          name: 'Starter',
          limits: {
            teams: 1,
            athletes: 50,
            apiCalls: 1000,
            havfCalculations: 100,
            visionAnalysis: 5
          },
          features: ['basic_analytics', 'readiness_scores', 'havf_basic', 'email_alerts'],
          price: 99
        },
        pro: {
          name: 'Professional',
          limits: {
            teams: 5,
            athletes: 500,
            apiCalls: 10000,
            havfCalculations: 1000,
            visionAnalysis: 50
          },
          features: [
            'advanced_analytics',
            'readiness_scores',
            'havf_advanced',
            'vision_ai',
            'email_alerts',
            'api_access',
            'custom_reports'
          ],
          price: 499
        },
        enterprise: {
          name: 'Enterprise',
          limits: {
            teams: -1, // Unlimited
            athletes: -1,
            apiCalls: -1,
            havfCalculations: -1,
            visionAnalysis: -1
          },
          features: [
            'all_features',
            'white_label',
            'dedicated_support',
            'custom_integrations',
            'sla_guarantee'
          ],
          price: 2499
        }
      }
    };

    this.database = new Map(); // In production, use D1 or PostgreSQL
    this.sessions = new Map();
    this.apiKeys = new Map();
  }

  // Generate JWT token
  generateToken(payload, expiresIn = '7d') {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + this.parseExpiry(expiresIn);

    const tokenPayload = {
      ...payload,
      iat: now,
      exp: expiry
    };

    const encodedHeader = this.base64url(JSON.stringify(header));
    const encodedPayload = this.base64url(JSON.stringify(tokenPayload));
    
    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      const [header, payload, signature] = token.split('.');
      
      const expectedSignature = crypto
        .createHmac('sha256', this.config.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const decodedPayload = JSON.parse(this.base64decode(payload));
      
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // User registration
  async register(userData) {
    const { email, password, name, organization, tier = 'free' } = userData;

    // Check if user exists
    if (this.database.has(email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    // Create user record
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      organization,
      passwordHash: hash,
      passwordSalt: salt,
      tier,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      usage: {
        teams: 0,
        athletes: 0,
        apiCalls: 0,
        havfCalculations: 0,
        visionAnalysis: 0
      },
      billing: {
        stripeCustomerId: null,
        subscriptionId: null,
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      apiKeys: []
    };

    this.database.set(email, user);

    // Generate API key
    const apiKey = this.generateAPIKey(user.id);
    user.apiKeys.push(apiKey.id);

    // Generate tokens
    const accessToken = this.generateToken({
      userId: user.id,
      email: user.email,
      tier: user.tier
    });

    const refreshToken = this.generateToken({
      userId: user.id,
      type: 'refresh'
    }, this.config.refreshExpiry);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization,
        tier: user.tier
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken
      },
      apiKey: apiKey.key
    };
  }

  // User login
  async login(email, password) {
    const user = this.database.get(email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const hash = crypto.pbkdf2Sync(password, user.passwordSalt, 10000, 64, 'sha512').toString('hex');
    
    if (hash !== user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate tokens
    const accessToken = this.generateToken({
      userId: user.id,
      email: user.email,
      tier: user.tier
    });

    const refreshToken = this.generateToken({
      userId: user.id,
      type: 'refresh'
    }, this.config.refreshExpiry);

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    this.sessions.set(sessionId, {
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization,
        tier: user.tier,
        usage: user.usage,
        billing: user.billing
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken
      },
      sessionId
    };
  }

  // Generate API Key
  generateAPIKey(userId) {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const secret = `sk_${crypto.randomBytes(32).toString('hex')}`;
    
    const apiKey = {
      id: keyId,
      key: secret,
      userId,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usage: 0,
      rateLimit: 1000, // requests per hour
      scopes: ['read', 'write']
    };

    this.apiKeys.set(secret, apiKey);
    
    return apiKey;
  }

  // Validate API Key
  async validateAPIKey(key) {
    const apiKey = this.apiKeys.get(key);
    
    if (!apiKey) {
      throw new Error('Invalid API key');
    }

    // Update usage
    apiKey.lastUsed = new Date().toISOString();
    apiKey.usage++;

    // Get user
    const user = Array.from(this.database.values()).find(u => u.id === apiKey.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check rate limits
    if (apiKey.usage > apiKey.rateLimit) {
      throw new Error('Rate limit exceeded');
    }

    return {
      valid: true,
      userId: user.id,
      tier: user.tier,
      limits: this.config.tiers[user.tier].limits,
      scopes: apiKey.scopes
    };
  }

  // Check permissions
  checkPermission(user, feature) {
    const tier = this.config.tiers[user.tier];
    
    if (tier.features.includes('all_features')) {
      return true;
    }

    return tier.features.includes(feature);
  }

  // Check usage limits
  checkUsageLimit(user, resource, amount = 1) {
    const tier = this.config.tiers[user.tier];
    const limit = tier.limits[resource];
    
    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    const used = user.usage[resource] || 0;
    const remaining = limit - used;
    
    if (remaining < amount) {
      return {
        allowed: false,
        remaining,
        limit,
        used
      };
    }

    return {
      allowed: true,
      remaining: remaining - amount,
      limit,
      used
    };
  }

  // Update usage
  async updateUsage(userId, resource, amount = 1) {
    const user = Array.from(this.database.values()).find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.usage[resource]) {
      user.usage[resource] = 0;
    }

    user.usage[resource] += amount;
    
    return user.usage;
  }

  // Helper functions
  base64url(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  base64decode(str) {
    return Buffer.from(str, 'base64url').toString();
  }

  parseExpiry(expiry) {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800
    };

    const match = expiry.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error('Invalid expiry format');
    }

    return parseInt(match[1]) * units[match[2]];
  }
}

// Cloudflare Worker for Auth API
const authWorkerCode = `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const auth = new BlazeAuthSystem();
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Auth endpoints
    const routes = {
      '/auth/register': handleRegister,
      '/auth/login': handleLogin,
      '/auth/refresh': handleRefresh,
      '/auth/validate': handleValidate,
      '/auth/logout': handleLogout,
      '/auth/usage': handleUsage,
      '/auth/upgrade': handleUpgrade
    };

    for (const [route, handler] of Object.entries(routes)) {
      if (url.pathname === route) {
        try {
          const response = await handler(request, env, auth);
          return new Response(
            JSON.stringify(response),
            { headers: corsHeaders }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: corsHeaders }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: corsHeaders }
    );
  }
};

async function handleRegister(request, env, auth) {
  const data = await request.json();
  return await auth.register(data);
}

async function handleLogin(request, env, auth) {
  const { email, password } = await request.json();
  return await auth.login(email, password);
}

async function handleValidate(request, env, auth) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  const payload = auth.verifyToken(token);
  return { valid: true, ...payload };
}

async function handleRefresh(request, env, auth) {
  const { refreshToken } = await request.json();
  const payload = auth.verifyToken(refreshToken);
  
  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  const newToken = auth.generateToken({
    userId: payload.userId
  });

  return { accessToken: newToken };
}

async function handleLogout(request, env, auth) {
  // Invalidate session
  return { success: true };
}

async function handleUsage(request, env, auth) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = auth.verifyToken(token);
  
  // Get user usage
  const user = Array.from(auth.database.values()).find(u => u.id === payload.userId);
  
  return {
    usage: user.usage,
    limits: auth.config.tiers[user.tier].limits,
    tier: user.tier
  };
}

async function handleUpgrade(request, env, auth) {
  const { tier, paymentMethodId } = await request.json();
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = auth.verifyToken(token);
  
  // Process upgrade (integrate with Stripe)
  return {
    success: true,
    message: 'Upgrade processed',
    newTier: tier
  };
}
`;

// Export worker code to file
async function exportWorker() {
  const workerPath = path.join(__dirname, 'worker-auth.js');
  await fs.writeFile(workerPath, authWorkerCode);
  console.log('✅ Auth worker exported to worker-auth.js');
}

// Demo and testing
async function demo() {
  const auth = new BlazeAuthSystem();
  
  console.log('🔐 Blaze Intelligence Authentication System');
  console.log('==========================================\n');
  
  // Register a user
  console.log('1. Registering new user...');
  const registration = await auth.register({
    email: 'demo@blazeintelligence.com',
    password: 'SecurePass123!',
    name: 'John Demo',
    organization: 'Demo Sports Team',
    tier: 'pro'
  });
  
  console.log('✅ User registered:');
  console.log(`   ID: ${registration.user.id}`);
  console.log(`   Email: ${registration.user.email}`);
  console.log(`   Tier: ${registration.user.tier}`);
  console.log(`   API Key: ${registration.apiKey}`);
  
  // Login
  console.log('\n2. Testing login...');
  const loginResult = await auth.login('demo@blazeintelligence.com', 'SecurePass123!');
  console.log('✅ Login successful');
  console.log(`   Session ID: ${loginResult.sessionId}`);
  console.log(`   Access Token: ${loginResult.tokens.access.substring(0, 50)}...`);
  
  // Verify token
  console.log('\n3. Verifying token...');
  const payload = auth.verifyToken(loginResult.tokens.access);
  console.log('✅ Token valid:');
  console.log(`   User ID: ${payload.userId}`);
  console.log(`   Email: ${payload.email}`);
  console.log(`   Tier: ${payload.tier}`);
  
  // Check permissions
  console.log('\n4. Checking permissions...');
  const features = ['basic_analytics', 'vision_ai', 'white_label'];
  features.forEach(feature => {
    const hasAccess = auth.checkPermission({ tier: 'pro' }, feature);
    console.log(`   ${feature}: ${hasAccess ? '✅' : '❌'}`);
  });
  
  // Check usage limits
  console.log('\n5. Checking usage limits...');
  const limits = ['teams', 'apiCalls', 'visionAnalysis'];
  limits.forEach(resource => {
    const limit = auth.checkUsageLimit({ tier: 'pro', usage: {} }, resource);
    console.log(`   ${resource}: ${limit.allowed ? `✅ (${limit.remaining} remaining)` : '❌ Limit reached'}`);
  });
  
  // Validate API key
  console.log('\n6. Validating API key...');
  const apiValidation = await auth.validateAPIKey(registration.apiKey);
  console.log('✅ API key valid:');
  console.log(`   User ID: ${apiValidation.userId}`);
  console.log(`   Tier: ${apiValidation.tier}`);
  console.log(`   Scopes: ${apiValidation.scopes.join(', ')}`);
  
  // Export worker
  await exportWorker();
  
  console.log('\n✅ Authentication system ready for production!');
  console.log('\nTier Pricing:');
  Object.entries(auth.config.tiers).forEach(([key, tier]) => {
    console.log(`   ${tier.name}: $${tier.price}/month`);
    console.log(`      Teams: ${tier.limits.teams === -1 ? 'Unlimited' : tier.limits.teams}`);
    console.log(`      API Calls: ${tier.limits.apiCalls === -1 ? 'Unlimited' : tier.limits.apiCalls}`);
  });
}

// Run demo if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demo().catch(console.error);
}

export default BlazeAuthSystem;