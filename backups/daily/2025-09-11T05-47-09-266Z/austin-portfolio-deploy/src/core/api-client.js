/**
 * Blaze Intelligence API Client
 * Enhanced, centralized API communication with error handling, caching, and retry logic
 */

class BlazeApiClient {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api',
      timeout: config.timeout || 5000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };
    
    this.cache = new Map();
    this.requestQueue = new Map();
    this.rateLimiters = new Map();
    
    // Bind methods
    this.request = this.request.bind(this);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  /**
   * Rate limiting implementation
   */
  checkRateLimit(endpoint) {
    const now = Date.now();
    const limit = this.config.rateLimit || { requests: 100, window: 60000 };
    const key = `${endpoint}-rate-limit`;
    
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, { count: 1, resetTime: now + limit.window });
      return true;
    }
    
    const limiter = this.rateLimiters.get(key);
    
    if (now > limiter.resetTime) {
      this.rateLimiters.set(key, { count: 1, resetTime: now + limit.window });
      return true;
    }
    
    if (limiter.count >= limit.requests) {
      throw new Error(`Rate limit exceeded for ${endpoint}. Try again in ${Math.ceil((limiter.resetTime - now) / 1000)} seconds.`);
    }
    
    limiter.count++;
    return true;
  }

  /**
   * Cache management
   */
  getCached(key, ttl = 5 * 60 * 1000) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Simple LRU cleanup
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Request deduplication
   */
  async deduplicateRequest(key, requestFn) {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }
    
    const promise = requestFn();
    this.requestQueue.set(key, promise);
    
    try {
      const result = await promise;
      this.requestQueue.delete(key);
      return result;
    } catch (error) {
      this.requestQueue.delete(key);
      throw error;
    }
  }

  /**
   * Enhanced fetch with retry logic
   */
  async fetchWithRetry(url, options, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.config.retries && !error.name === 'AbortError') {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Core request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`;
    
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.getCached(cacheKey, options.cacheTTL);
      if (cached) {
        return { ...cached, cached: true };
      }
    }
    
    // Rate limiting
    this.checkRateLimit(endpoint);
    
    // Request deduplication
    return this.deduplicateRequest(cacheKey, async () => {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Blaze-Client': 'api-client/2.1.0',
          ...this.config.headers,
          ...options.headers
        },
        ...options
      };
      
      if (options.body && typeof options.body === 'object') {
        requestOptions.body = JSON.stringify(options.body);
      }
      
      const response = await this.fetchWithRetry(url, requestOptions);
      const data = await response.json();
      
      // Cache successful GET requests
      if ((!options.method || options.method === 'GET') && data.success) {
        this.setCached(cacheKey, data);
      }
      
      return data;
    });
  }

  /**
   * Convenience methods
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Specialized API methods for Blaze Intelligence
   */
  
  // Health and status
  async getHealth() {
    return this.get('/enhanced-gateway?endpoint=health');
  }

  async getSystemStatus() {
    return this.get('/enhanced-live-metrics?endpoint=system');
  }

  // Cardinals analytics
  async getCardinalsAnalytics(options = {}) {
    return this.get('/enhanced-gateway?endpoint=cardinals-analytics', options);
  }

  async getCardinalsReadiness() {
    return this.get('/cardinals/readiness');
  }

  async getCardinalsLiveMetrics() {
    return this.get('/enhanced-live-metrics?endpoint=cardinals');
  }

  // Multi-sport dashboard
  async getMultiSportDashboard() {
    return this.get('/enhanced-gateway?endpoint=multi-sport-dashboard');
  }

  async getCrossLeagueInsights() {
    return this.get('/enhanced-live-metrics?endpoint=cross-league');
  }

  // Notifications and alerts
  async getNotifications(userId = null) {
    const params = userId ? `&userId=${userId}` : '';
    return this.get(`/enhanced-gateway?endpoint=notifications${params}`);
  }

  async getContentRecommendations() {
    return this.get('/enhanced-live-metrics?endpoint=recommendations');
  }

  // AI services
  async analyzeWithAI(prompt, context = {}, options = {}) {
    return this.post('/ai-services/multi-ai-orchestrator', {
      prompt,
      context,
      ...options
    });
  }

  // Video analysis
  async analyzeVideo(videoData, options = {}) {
    return this.post('/video-analysis/ai-coaching-engine', {
      videoData,
      ...options
    });
  }

  // Data providers
  async getSportRadarData(params = {}) {
    return this.get('/data-providers/sportradar', { params });
  }

  async getStatsPerformData(params = {}) {
    return this.get('/data-providers/stats-perform', { params });
  }

  /**
   * Batch operations
   */
  async batchRequest(requests) {
    const promises = requests.map(({ endpoint, options }) => 
      this.request(endpoint, options).catch(error => ({ error: error.message }))
    );
    
    return Promise.all(promises);
  }

  /**
   * Real-time subscriptions (Server-Sent Events)
   */
  subscribeToUpdates(endpoint, callback, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (options.onError) {
        options.onError(error);
      }
    };
    
    return eventSource;
  }

  /**
   * Cleanup methods
   */
  clearCache() {
    this.cache.clear();
  }

  clearRateLimiters() {
    this.rateLimiters.clear();
  }

  destroy() {
    this.clearCache();
    this.clearRateLimiters();
    this.requestQueue.clear();
  }
}

// Create singleton instance
let apiClientInstance = null;

export function createApiClient(config) {
  if (!apiClientInstance) {
    apiClientInstance = new BlazeApiClient(config);
  }
  return apiClientInstance;
}

export function getApiClient() {
  if (!apiClientInstance) {
    apiClientInstance = new BlazeApiClient();
  }
  return apiClientInstance;
}

// Browser/Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeApiClient, createApiClient, getApiClient };
} else if (typeof window !== 'undefined') {
  window.BlazeApiClient = BlazeApiClient;
  window.createApiClient = createApiClient;
  window.getApiClient = getApiClient;
}