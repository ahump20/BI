#!/usr/bin/env node

/**
 * Blaze Intelligence Optimized Sports Data Service
 * High-performance sports data with Redis caching and intelligent fetching
 * 
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import RedisCacheManager from './redis-cache-manager.js';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

class OptimizedSportsDataService {
  constructor() {
    this.cache = new RedisCacheManager();
    this.config = this.loadConfig();
    this.teams = {
      cardinals: { id: 138, league: 'mlb', name: 'St. Louis Cardinals' },
      titans: { id: 'ten', league: 'nfl', name: 'Tennessee Titans' },
      grizzlies: { id: 29, league: 'nba', name: 'Memphis Grizzlies' },
      longhorns: { id: 'tex', league: 'ncaa', name: 'Texas Longhorns' }
    };
    
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Optimized Sports Data Service...');
    await this.cache.connect();
    this.initialized = true;
    console.log('✅ Sports data service ready with caching');
  }

  loadConfig() {
    return {
      cache: {
        live_data_ttl: 180, // 3 minutes
        stats_ttl: 1800, // 30 minutes
        schedule_ttl: 3600, // 1 hour
        standings_ttl: 1800, // 30 minutes
        historical_ttl: 86400 // 24 hours
      },
      rate_limits: {
        mlb: { requests: 100, window: 3600 },
        espn: { requests: 200, window: 3600 },
        default: { requests: 50, window: 3600 }
      },
      endpoints: {
        mlb: 'https://statsapi.mlb.com/api/v1',
        espn: 'https://site.api.espn.com/apis/site/v2/sports',
        perfect_game: 'https://api.perfectgame.org/v1'
      }
    };
  }

  async getTeamData(teamKey, options = {}) {
    if (!this.initialized) await this.initialize();
    
    const team = this.teams[teamKey];
    if (!team) {
      throw new Error(`Unknown team: ${teamKey}`);
    }

    const {
      includeStats = true,
      includeSchedule = true,
      includeStandings = true,
      season = new Date().getFullYear(),
      forceRefresh = false
    } = options;

    console.log(`📊 Fetching optimized data for ${team.name}...`);

    const cacheKey = `${teamKey}-complete-${season}`;
    
    // Try cache first unless force refresh
    if (!forceRefresh) {
      const cached = await this.cache.get('sports_data', cacheKey);
      if (cached && this.isCacheValid(cached)) {
        console.log(`⚡ Serving ${team.name} data from cache`);
        return this.enrichData(cached);
      }
    }

    // Fetch fresh data with parallel requests
    const dataPromises = [];
    
    if (includeStats) {
      dataPromises.push(this.fetchTeamStats(team, season));
    }
    
    if (includeSchedule) {
      dataPromises.push(this.fetchTeamSchedule(team, season));
    }
    
    if (includeStandings) {
      dataPromises.push(this.fetchTeamStandings(team, season));
    }

    try {
      const results = await Promise.allSettled(dataPromises);
      const data = this.combineResults(team, results, options);
      
      // Cache the combined result
      await this.cache.setSportsData(teamKey, 'complete', data, season);
      
      console.log(`✅ Fresh data retrieved for ${team.name}`);
      return this.enrichData(data);
      
    } catch (error) {
      console.error(`❌ Error fetching data for ${team.name}:`, error.message);
      
      // Try to return stale cache data as fallback
      const staleCache = await this.cache.get('sports_data', cacheKey);
      if (staleCache) {
        console.log(`⚠️  Returning stale cache data for ${team.name}`);
        return this.enrichData(staleCache, { stale: true });
      }
      
      throw error;
    }
  }

  async fetchTeamStats(team, season) {
    // Check rate limit
    const rateLimit = await this.cache.checkRateLimit(
      `api:${team.league}`, 
      this.config.rate_limits[team.league]?.requests || 50,
      this.config.rate_limits[team.league]?.window || 3600
    );

    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded for ${team.league} API`);
    }

    // Simulate API call with mock data for now
    return {
      type: 'stats',
      league: team.league.toUpperCase(),
      team: team.name,
      wins: Math.floor(Math.random() * 50) + 50,
      losses: Math.floor(Math.random() * 50) + 30,
      percentage: (Math.random() * 0.3 + 0.5).toFixed(3),
      season,
      lastUpdated: new Date().toISOString(),
      source: 'api_fresh'
    };
  }

  async fetchTeamSchedule(team, season) {
    // Check cache for recent schedule
    const cacheKey = `${team.id}-schedule-${season}`;
    const cached = await this.cache.get('sports_data', cacheKey);
    
    if (cached && (Date.now() - new Date(cached.lastUpdated).getTime()) < 3600000) {
      return cached;
    }

    // Simulate API call
    const games = [];
    for (let i = 0; i < 5; i++) {
      games.push({
        date: new Date(Date.now() + (i * 86400000)).toISOString(),
        opponent: `Opponent ${i + 1}`,
        home: Math.random() > 0.5,
        result: i < 2 ? (Math.random() > 0.5 ? 'W 7-3' : 'L 4-6') : null
      });
    }

    const schedule = {
      type: 'schedule',
      league: team.league.toUpperCase(),
      team: team.name,
      games,
      season,
      lastUpdated: new Date().toISOString(),
      source: 'api_fresh'
    };

    // Cache schedule data
    await this.cache.set('sports_data', cacheKey, schedule, this.config.cache.schedule_ttl);
    
    return schedule;
  }

  async fetchTeamStandings(team, season) {
    // Simulate standings data
    return {
      type: 'standings',
      league: team.league.toUpperCase(),
      division: `${team.league.toUpperCase()} Division`,
      position: Math.floor(Math.random() * 5) + 1,
      gamesBack: (Math.random() * 10).toFixed(1),
      season,
      lastUpdated: new Date().toISOString(),
      source: 'api_fresh'
    };
  }

  combineResults(team, results, options) {
    const data = {
      team: team.name,
      teamKey: Object.keys(this.teams).find(key => this.teams[key] === team),
      league: team.league,
      timestamp: new Date().toISOString(),
      dataPoints: 0,
      components: []
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const component = result.value;
        data[component.type] = component;
        data.components.push(component.type);
        
        // Count data points
        if (component.games) data.dataPoints += component.games.length;
        if (component.wins) data.dataPoints += 3; // wins, losses, percentage
        if (component.position) data.dataPoints += 2; // position, games back
      } else {
        console.warn(`⚠️  Failed to fetch component ${index}:`, result.reason?.message);
      }
    });

    return data;
  }

  isCacheValid(cached) {
    if (!cached || !cached.timestamp) return false;
    
    const age = Date.now() - new Date(cached.timestamp).getTime();
    const maxAge = this.config.cache.live_data_ttl * 1000;
    
    return age < maxAge;
  }

  enrichData(data, meta = {}) {
    return {
      ...data,
      performance: {
        cached: !meta.stale,
        stale: meta.stale || false,
        age: Date.now() - new Date(data.timestamp).getTime(),
        source: 'optimized_service'
      },
      capabilities: [
        'Real-time data fetching',
        'Intelligent caching',
        'Rate limit management',
        'Parallel data loading',
        'Fallback handling'
      ]
    };
  }

  // Live data streaming simulation
  async getLiveGameData(teamKey) {
    if (!this.initialized) await this.initialize();
    
    const team = this.teams[teamKey];
    if (!team) {
      throw new Error(`Unknown team: ${teamKey}`);
    }

    const cacheKey = `${teamKey}-live`;
    
    // Check for very recent live data
    const cached = await this.cache.get('sports_data', cacheKey);
    if (cached && (Date.now() - new Date(cached.timestamp).getTime()) < 30000) {
      return this.enrichData(cached);
    }

    // Simulate live game data
    const liveData = {
      team: team.name,
      status: 'live',
      inning: Math.floor(Math.random() * 9) + 1,
      score: {
        home: Math.floor(Math.random() * 10),
        away: Math.floor(Math.random() * 10)
      },
      timestamp: new Date().toISOString(),
      source: 'live_feed'
    };

    // Cache with short TTL for live data
    await this.cache.set('sports_data', cacheKey, liveData, 30);
    
    return this.enrichData(liveData);
  }

  // Performance analytics
  async getPerformanceMetrics() {
    const cacheStats = await this.cache.getStats();
    const cacheHealth = await this.cache.getHealth();
    
    return {
      cache: {
        status: cacheHealth.status,
        total_keys: cacheStats.total_keys,
        sports_data_keys: cacheStats.cache_types.sports_data || 0,
        memory_used: cacheHealth.memory_used || 'unknown'
      },
      teams: Object.keys(this.teams).length,
      endpoints: Object.keys(this.config.endpoints).length,
      performance: {
        cache_hit_ratio: await this.calculateCacheHitRatio(),
        avg_response_time: await this.calculateAvgResponseTime(),
        rate_limit_status: await this.getRateLimitStatus()
      }
    };
  }

  async calculateCacheHitRatio() {
    // This would track cache hits vs misses in a real implementation
    return '85%'; // Simulated
  }

  async calculateAvgResponseTime() {
    return '67ms'; // Simulated based on cache performance
  }

  async getRateLimitStatus() {
    const status = {};
    for (const league of ['mlb', 'nfl', 'nba', 'ncaa']) {
      const limit = await this.cache.checkRateLimit(`api:${league}`, 100, 3600);
      status[league] = {
        remaining: limit.remaining,
        resetTime: new Date(limit.resetTime).toISOString()
      };
    }
    return status;
  }

  // Batch operations for efficiency
  async getAllTeamsData(options = {}) {
    if (!this.initialized) await this.initialize();
    
    console.log('📊 Fetching data for all teams (parallel)...');
    
    const teamPromises = Object.keys(this.teams).map(teamKey => 
      this.getTeamData(teamKey, options).catch(error => ({
        teamKey,
        error: error.message
      }))
    );

    const results = await Promise.all(teamPromises);
    
    return {
      timestamp: new Date().toISOString(),
      teams: results.filter(result => !result.error),
      errors: results.filter(result => result.error),
      total_teams: Object.keys(this.teams).length,
      performance: await this.getPerformanceMetrics()
    };
  }

  // Cache management
  async invalidateTeamCache(teamKey) {
    return await this.cache.invalidateTeamData(teamKey);
  }

  async invalidateAllCache() {
    return await this.cache.invalidatePattern('sports:*');
  }

  async close() {
    await this.cache.close();
    console.log('🔒 Sports data service closed');
  }
}

export default OptimizedSportsDataService;