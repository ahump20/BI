// Secure API Proxy for Blaze Intelligence
// This runs on the server-side to keep API keys secure

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'https://ahump20.github.io,https://blaze-intelligence.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { service, endpoint, ...params } = req.query;
  
  // Validate request origin
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://ahump20.github.io',
    'https://blaze-intelligence.netlify.app',
    'http://localhost:8000',
    'http://localhost:3000'
  ];
  
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  try {
    let response;
    
    switch(service) {
      case 'openai':
        response = await callOpenAI(endpoint, params);
        break;
      case 'stripe':
        response = await callStripe(endpoint, params);
        break;
      case 'sportsradar':
        response = await callSportsRadar({
          endpoint,
          params,
          method: req.method,
          body: req.body
        });
        break;
      case 'hubspot':
        response = await callHubSpot(endpoint, params);
        break;
      default:
        return res.status(400).json({ error: 'Invalid service' });
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function callOpenAI(endpoint, params) {
  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  
  return response.json();
}

async function callStripe(endpoint, params) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  switch(endpoint) {
    case 'create-checkout-session':
      return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: params.items,
        mode: 'subscription',
        success_url: params.success_url,
        cancel_url: params.cancel_url,
      });
    case 'create-customer':
      return await stripe.customers.create({
        email: params.email,
        name: params.name,
      });
    default:
      throw new Error('Invalid Stripe endpoint');
  }
}

async function callSportsRadar({ endpoint, params = {}, method = 'GET', body }) {
  const url = buildSportsRadarUrl(endpoint, params);
  const fetchOptions = {
    method: method?.toUpperCase() || 'GET',
    headers: {
      Accept: 'application/json'
    }
  };

  if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD' && body) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const contentType = response.headers.get('content-type') || '';
  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(`SportsRadar request failed: ${response.status} ${response.statusText}`);
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(responseBody || '{}');
  }

  return responseBody;
}

function buildSportsRadarUrl(endpoint, params) {
  const { sport, path, ...queryParams } = params || {};
  const targetPath = path || endpoint;

  if (!targetPath) {
    throw new Error('SportsRadar endpoint is required');
  }

  const url = createSportsRadarUrl(targetPath);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      });
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  const apiKey = resolveSportsRadarKey(sport);

  if (!apiKey) {
    throw new Error(`SportsRadar API key not configured for ${sport || 'default'} requests`);
  }

  url.searchParams.set('api_key', apiKey);

  return url;
}

function createSportsRadarUrl(targetPath) {
  if (/^https?:\/\//i.test(targetPath)) {
    return new URL(targetPath);
  }

  const normalizedPath = String(targetPath).replace(/^\/+/, '');
  return new URL(normalizedPath, 'https://api.sportradar.us/');
}

function resolveSportsRadarKey(sport) {
  const normalizedSport = (sport || '').toLowerCase();
  const keyMap = {
    mlb: process.env.SPORTRADAR_MLB_KEY || process.env.SPORTSRADAR_MLB_KEY,
    nfl: process.env.SPORTRADAR_NFL_KEY || process.env.SPORTSRADAR_NFL_KEY,
    nba: process.env.SPORTRADAR_NBA_KEY || process.env.SPORTSRADAR_NBA_KEY,
    ncaaf: process.env.SPORTRADAR_NCAAF_KEY || process.env.SPORTSRADAR_NCAAF_KEY,
    ncaafb: process.env.SPORTRADAR_NCAAF_KEY || process.env.SPORTSRADAR_NCAAF_KEY
  };

  return keyMap[normalizedSport] || process.env.SPORTSRADAR_MASTER_API_KEY || process.env.SPORTRADAR_MASTER_API_KEY;
}

async function callHubSpot(endpoint, params) {
  const response = await fetch(`https://api.hubapi.com/${endpoint}`, {
    method: params.method || 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: params.method === 'POST' ? JSON.stringify(params.data) : undefined
  });
  
  return response.json();
}