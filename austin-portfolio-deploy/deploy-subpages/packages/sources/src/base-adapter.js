/**
 * Base adapter class that all sport-specific adapters must implement
 * Ensures consistent interface and compliance with robots.txt and ToS
 */

import axios from 'axios';

export class BaseAdapter {
  constructor(config = {}) {
    this.config = {
      userAgent: 'BlazeSportsIntelBot/1.0 (+https://blazesportsintel.com)',
      respectRobotsTxt: true,
      rateLimitMs: 1000, // 1 second between requests by default
      timeout: 30000,
      retryAttempts: 3,
      retryDelayMs: 2000,
      ...config
    };

    this.lastRequestTime = 0;
    this.httpClient = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'application/json, text/html, */*'
      }
    });
  }

  /**
   * Rate limiting - ensure we don't make requests too quickly
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.rateLimitMs) {
      const delay = this.config.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make HTTP request with retry logic and rate limiting
   */
  async makeRequest(url, options = {}) {
    await this.enforceRateLimit();

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await this.httpClient.request({
          url,
          ...options
        });

        return response.data;
      } catch (error) {
        console.warn(`Request attempt ${attempt} failed for ${url}:`, error.message);

        if (attempt === this.config.retryAttempts) {
          throw error;
        }

        // Exponential backoff
        const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Check robots.txt compliance (override in subclasses)
   */
  async checkRobotsTxt(baseUrl) {
    if (!this.config.respectRobotsTxt) {
      return true;
    }

    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const robotsText = await this.makeRequest(robotsUrl);

      // Simple check - look for our user agent or * disallow
      const lines = robotsText.split('\n').map(line => line.trim().toLowerCase());
      let userAgentMatch = false;

      for (const line of lines) {
        if (line.startsWith('user-agent:')) {
          userAgentMatch = line.includes('*') || line.includes('blazesportsintelbot');
        } else if (userAgentMatch && line.startsWith('disallow:')) {
          // If disallow is not empty, we should respect it
          if (line.replace('disallow:', '').trim() === '/') {
            return false; // Disallowed
          }
        }
      }

      return true; // Allowed
    } catch (error) {
      console.warn('Could not check robots.txt, proceeding with caution:', error.message);
      return true; // If we can't check, assume allowed but be cautious
    }
  }

  /**
   * Must be implemented by subclasses
   */
  async discover() {
    throw new Error('discover() must be implemented by subclass');
  }

  async fetchTeams() {
    throw new Error('fetchTeams() must be implemented by subclass');
  }

  async fetchPlayers() {
    throw new Error('fetchPlayers() must be implemented by subclass');
  }

  async fetchGames() {
    throw new Error('fetchGames() must be implemented by subclass');
  }

  async fetchStandings() {
    throw new Error('fetchStandings() must be implemented by subclass');
  }

  async normalize(rawData) {
    throw new Error('normalize() must be implemented by subclass');
  }

  async validate(data) {
    throw new Error('validate() must be implemented by subclass');
  }

  async persist(data) {
    throw new Error('persist() must be implemented by subclass');
  }

  async publish(data) {
    throw new Error('publish() must be implemented by subclass');
  }

  async report() {
    throw new Error('report() must be implemented by subclass');
  }

  /**
   * Helper method to generate external references
   */
  generateExternalRef(source, id) {
    return {
      [source]: id,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Helper method to create linkouts
   */
  createLinkout(entityType, entityId, source, url) {
    return {
      id: `${entityType}-${entityId}-${source}`,
      entityType,
      entityId,
      source,
      url,
      verified: false,
      lastChecked: new Date().toISOString(),
      isActive: true
    };
  }

  /**
   * Log activities for monitoring
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      timestamp,
      level,
      adapter: this.constructor.name,
      message,
      ...data
    }));
  }
}

export default BaseAdapter;