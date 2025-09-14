/**
 * Blaze Intelligence Environment Configuration
 * Centralized configuration management for all environments
 */

const environments = {
  development: {
    name: 'development',
    api: {
      baseUrl: 'http://localhost:3000/api',
      timeout: 10000,
      retries: 3,
      rateLimit: {
        requests: 1000,
        window: 60000 // 1 minute
      }
    },
    features: {
      debugging: true,
      analytics: true,
      caching: false,
      monitoring: false
    },
    integrations: {
      openai: {
        enabled: false,
        model: 'gpt-4',
        maxTokens: 2000
      },
      anthropic: {
        enabled: false,
        model: 'claude-3-sonnet',
        maxTokens: 4000
      },
      gemini: {
        enabled: false,
        model: 'gemini-pro',
        maxTokens: 2000
      }
    },
    sports: {
      leagues: ['MLB', 'NFL', 'NBA', 'NCAA'],
      focusTeams: {
        mlb: 'Cardinals',
        nfl: 'Titans', 
        nba: 'Grizzlies',
        ncaa: 'Longhorns'
      },
      dataRefreshInterval: 30000 // 30 seconds
    },
    ui: {
      theme: 'dark',
      animations: true,
      notifications: true,
      autoRefresh: true
    }
  },

  staging: {
    name: 'staging',
    api: {
      baseUrl: 'https://blaze-intelligence-staging.netlify.app/api',
      timeout: 8000,
      retries: 3,
      rateLimit: {
        requests: 500,
        window: 60000
      }
    },
    features: {
      debugging: false,
      analytics: true,
      caching: true,
      monitoring: true
    },
    integrations: {
      openai: {
        enabled: true,
        model: 'gpt-4',
        maxTokens: 2000
      },
      anthropic: {
        enabled: true,
        model: 'claude-3-sonnet',
        maxTokens: 4000
      },
      gemini: {
        enabled: true,
        model: 'gemini-pro',
        maxTokens: 2000
      }
    },
    sports: {
      leagues: ['MLB', 'NFL', 'NBA', 'NCAA'],
      focusTeams: {
        mlb: 'Cardinals',
        nfl: 'Titans',
        nba: 'Grizzlies', 
        ncaa: 'Longhorns'
      },
      dataRefreshInterval: 60000 // 1 minute
    },
    ui: {
      theme: 'dark',
      animations: true,
      notifications: true,
      autoRefresh: true
    }
  },

  production: {
    name: 'production',
    api: {
      baseUrl: 'https://blaze-intelligence.netlify.app/api',
      timeout: 5000,
      retries: 2,
      rateLimit: {
        requests: 100,
        window: 60000
      }
    },
    features: {
      debugging: false,
      analytics: true,
      caching: true,
      monitoring: true
    },
    integrations: {
      openai: {
        enabled: true,
        model: 'gpt-4',
        maxTokens: 1500
      },
      anthropic: {
        enabled: true,
        model: 'claude-3-sonnet',
        maxTokens: 3000
      },
      gemini: {
        enabled: true,
        model: 'gemini-pro',
        maxTokens: 1500
      }
    },
    sports: {
      leagues: ['MLB', 'NFL', 'NBA', 'NCAA'],
      focusTeams: {
        mlb: 'Cardinals',
        nfl: 'Titans',
        nba: 'Grizzlies',
        ncaa: 'Longhorns'
      },
      dataRefreshInterval: 120000 // 2 minutes
    },
    ui: {
      theme: 'dark',
      animations: true,
      notifications: false,
      autoRefresh: true
    }
  }
};

/**
 * Get configuration for current environment
 */
function getConfig() {
  const env = process.env.BLAZE_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const config = environments[env] || environments.development;
  
  return {
    ...config,
    env,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.1.0'
  };
}

/**
 * Get API configuration with security headers
 */
function getApiConfig() {
  const config = getConfig();
  
  return {
    baseUrl: config.api.baseUrl,
    timeout: config.api.timeout,
    retries: config.api.retries,
    headers: {
      'Content-Type': 'application/json',
      'X-Blaze-Environment': config.env,
      'X-Blaze-Version': config.version,
      'User-Agent': `Blaze-Intelligence/${config.version} (${config.env})`
    },
    rateLimit: config.api.rateLimit
  };
}

/**
 * Get feature flags for current environment
 */
function getFeatureFlags() {
  const config = getConfig();
  return config.features;
}

/**
 * Get integration settings
 */
function getIntegrations() {
  const config = getConfig();
  return config.integrations;
}

/**
 * Get sports configuration
 */
function getSportsConfig() {
  const config = getConfig();
  return config.sports;
}

/**
 * Get UI configuration
 */
function getUIConfig() {
  const config = getConfig();
  return config.ui;
}

/**
 * Validate environment configuration
 */
function validateConfig() {
  const config = getConfig();
  const errors = [];
  
  // Validate required fields
  if (!config.api.baseUrl) {
    errors.push('API base URL is required');
  }
  
  if (!config.sports.focusTeams) {
    errors.push('Focus teams configuration is required');
  }
  
  // Validate API timeout
  if (config.api.timeout < 1000 || config.api.timeout > 30000) {
    errors.push('API timeout must be between 1000ms and 30000ms');
  }
  
  // Validate data refresh interval
  if (config.sports.dataRefreshInterval < 10000) {
    errors.push('Data refresh interval must be at least 10 seconds');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    config
  };
}

/**
 * Export configuration utilities
 */
module.exports = {
  environments,
  getConfig,
  getApiConfig,
  getFeatureFlags,
  getIntegrations,
  getSportsConfig,
  getUIConfig,
  validateConfig
};

// Browser compatibility
if (typeof window !== 'undefined') {
  window.BlazeConfig = {
    getConfig,
    getApiConfig,
    getFeatureFlags,
    getIntegrations,
    getSportsConfig,
    getUIConfig,
    validateConfig
  };
}