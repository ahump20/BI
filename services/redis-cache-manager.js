#!/usr/bin/env node

/**
 * Blaze Intelligence Redis Cache Manager
 * Optimizes sports data performance with intelligent caching
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import Redis from 'ioredis';
import { createHash } from 'crypto';

class RedisCacheManager {
  constructor(options = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: options.db || 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      ...options
    };

    this.client = null;
    this.connected = false;
    this.cache_prefixes = {
      sports_data: 'sports:',
      biometric: 'bio:',
      analytics: 'analytics:',
      session: 'session:',
      rate_limit: 'rate:',
      temp: 'temp:',
      scoreboard: 'scoreboard:',
      standings: 'standings:'
    };

    const parseTtl = (value, fallback) => {
      const numeric = Number.parseInt(value ?? '', 10);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
    };

    this.default_ttl = {
      sports_data: 300, // 5 minutes
      biometric: 1800, // 30 minutes
      analytics: 3600, // 1 hour
      session: 86400, // 24 hours
      rate_limit: 900, // 15 minutes
      temp: 60, // 1 minute
      scoreboard: parseTtl(process.env.SCOREBOARD_CACHE_TTL, 15),
      standings: parseTtl(process.env.STANDINGS_CACHE_TTL, 1800)
    };
  }

  async connect() {
    if (this.connected) return this.client;

    try {
      this.client = new Redis(this.config);

      this.client.on('connect', () => {
        console.log('🔗 Redis connected');
        this.connected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis error:', error.message);
        this.connected = false;
      });

      this.client.on('close', () => {
        console.log('🔒 Redis connection closed');
        this.connected = false;
      });

      // Test connection
      await this.client.ping();
      console.log('✅ Redis cache manager initialized');
      
      return this.client;
    } catch (error) {
      console.warn('⚠️  Redis unavailable, using memory cache fallback');
      this.client = new MemoryCache();
      return this.client;
    }
  }

  generateKey(type, identifier, params = {}) {
    const prefix = this.cache_prefixes[type] || 'misc:';
    const paramsHash = Object.keys(params).length > 0 
      ? createHash('md5').update(JSON.stringify(params)).digest('hex').substring(0, 8)
      : '';
    
    return `${prefix}${identifier}${paramsHash ? ':' + paramsHash : ''}`;
  }

  async get(type, identifier, params = {}) {
    if (!this.client) await this.connect();

    const key = this.generateKey(type, identifier, params);
    
    try {
      const cached = await this.client.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        console.log(`📊 Cache hit: ${key}`);
        return data;
      }
      console.log(`📭 Cache miss: ${key}`);
      return null;
    } catch (error) {
      console.warn(`⚠️  Cache get error for ${key}:`, error.message);
      return null;
    }
  }

  async set(type, identifier, data, customTtl = null, params = {}) {
    if (!this.client) await this.connect();

    const key = this.generateKey(type, identifier, params);
    const ttl = customTtl || this.default_ttl[type] || 300;
    
    try {
      const serialized = JSON.stringify(data);
      await this.client.setex(key, ttl, serialized);
      console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.warn(`⚠️  Cache set error for ${key}:`, error.message);
      return false;
    }
  }

  async delete(type, identifier, params = {}) {
    if (!this.client) await this.connect();

    const key = this.generateKey(type, identifier, params);
    
    try {
      const result = await this.client.del(key);
      console.log(`🗑️  Deleted cache: ${key}`);
      return result > 0;
    } catch (error) {
      console.warn(`⚠️  Cache delete error for ${key}:`, error.message);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    if (!this.client) await this.connect();

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`🧹 Invalidated ${keys.length} keys matching: ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      console.warn(`⚠️  Pattern invalidation error for ${pattern}:`, error.message);
      return 0;
    }
  }

  // Sports-specific caching methods
  async getSportsData(team, dataType, season = null) {
    const params = season ? { season } : {};
    return await this.get('sports_data', `${team}:${dataType}`, params);
  }

  async setSportsData(team, dataType, data, season = null) {
    const params = season ? { season } : {};
    return await this.set('sports_data', `${team}:${dataType}`, data, null, params);
  }

  async invalidateTeamData(team) {
    return await this.invalidatePattern(`${this.cache_prefixes.sports_data}${team}:*`);
  }

  // Biometric caching methods
  async getBiometricAnalysis(playerId, analysisType) {
    return await this.get('biometric', `${playerId}:${analysisType}`);
  }

  async setBiometricAnalysis(playerId, analysisType, analysis) {
    return await this.set('biometric', `${playerId}:${analysisType}`, analysis);
  }

  // Analytics caching methods
  async getAnalytics(reportType, timeframe) {
    return await this.get('analytics', `${reportType}:${timeframe}`);
  }

  async setAnalytics(reportType, timeframe, data) {
    return await this.set('analytics', `${reportType}:${timeframe}`, data);
  }

  // Rate limiting
  async checkRateLimit(identifier, maxRequests = 100, windowSeconds = 900) {
    if (!this.client) await this.connect();

    const key = this.generateKey('rate_limit', identifier);
    
    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }
      
      const remaining = Math.max(0, maxRequests - current);
      const ttl = await this.client.ttl(key);
      
      return {
        allowed: current <= maxRequests,
        remaining,
        resetTime: Date.now() + (ttl * 1000),
        current
      };
    } catch (error) {
      console.warn(`⚠️  Rate limit check error for ${identifier}:`, error.message);
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + (windowSeconds * 1000), current: 0 };
    }
  }

  // Session management
  async getSession(sessionId) {
    return await this.get('session', sessionId);
  }

  async setSession(sessionId, sessionData, ttl = null) {
    return await this.set('session', sessionId, sessionData, ttl || this.default_ttl.session);
  }

  async deleteSession(sessionId) {
    return await this.delete('session', sessionId);
  }

  // Health check and statistics
  async getHealth() {
    if (!this.client) return { status: 'disconnected', type: 'none' };

    try {
      const info = await this.client.info();
      const memory = await this.client.info('memory');
      const stats = await this.client.info('stats');

      return {
        status: 'connected',
        type: 'redis',
        version: this.extractInfoValue(info, 'redis_version'),
        memory_used: this.extractInfoValue(memory, 'used_memory_human'),
        total_commands: this.extractInfoValue(stats, 'total_commands_processed'),
        connected_clients: this.extractInfoValue(info, 'connected_clients'),
        uptime: this.extractInfoValue(info, 'uptime_in_seconds')
      };
    } catch (error) {
      return { status: 'error', type: 'redis', error: error.message };
    }
  }

  extractInfoValue(info, key) {
    const line = info.split('\n').find(line => line.startsWith(key + ':'));
    return line ? line.split(':')[1].trim() : 'unknown';
  }

  async getStats() {
    if (!this.connected) return { total_keys: 0, cache_types: {} };

    try {
      const totalKeys = await this.client.dbsize();
      const cacheTypes = {};

      for (const [type, prefix] of Object.entries(this.cache_prefixes)) {
        const keys = await this.client.keys(prefix + '*');
        cacheTypes[type] = keys.length;
      }

      return { total_keys: totalKeys, cache_types: cacheTypes };
    } catch (error) {
      console.warn('⚠️  Cache stats error:', error.message);
      return { total_keys: 0, cache_types: {}, error: error.message };
    }
  }

  async close() {
    if (this.client && this.connected) {
      await this.client.quit();
      console.log('🔒 Redis cache manager closed');
    }
  }
}

// Memory cache fallback for when Redis is unavailable
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    console.log('⚠️  Using memory cache fallback');
  }

  async ping() {
    return 'PONG';
  }

  async get(key) {
    return this.cache.get(key) || null;
  }

  async setex(key, ttl, value) {
    this.cache.set(key, value);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);
    
    this.timers.set(key, timer);
  }

  async del(...keys) {
    let deleted = 0;
    for (const key of keys) {
      if (this.cache.has(key)) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
        deleted++;
      }
    }
    return deleted;
  }

  async keys(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async incr(key) {
    const current = parseInt(this.cache.get(key) || '0', 10);
    const newValue = current + 1;
    this.cache.set(key, newValue.toString());
    return newValue;
  }

  async expire(key, seconds) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, seconds * 1000);
    
    this.timers.set(key, timer);
    return 1;
  }

  async ttl(key) {
    return this.timers.has(key) ? 60 : -1; // Approximate for memory cache
  }

  async info() {
    return `# Memory Cache Fallback\nkeys:${this.cache.size}`;
  }

  async dbsize() {
    return this.cache.size;
  }

  async quit() {
    this.cache.clear();
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

export default RedisCacheManager;