// Simple in-memory rate limiter
const rateLimitMap = new Map();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Basic rate limiting using IP address
  const ip = event.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10);
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(ts => now - ts < windowMs);
  if (recent.length >= maxRequests) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ success: false, error: 'Too many requests' })
    };
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid JSON' })
    };
  }

  const { service, action, data } = body;
  if (typeof service !== 'string' || typeof action !== 'string' || (data && typeof data !== 'object')) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid request parameters' })
    };
  }

  const apiKey = process.env.HAWKEYE_API_KEY;
  const baseUrl = process.env.HAWKEYE_BASE_URL || 'https://api.hawkeye.com';
  if (!apiKey) {
    console.error('Missing HAWKEYE_API_KEY');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Server configuration error' })
    };
  }

  try {
    const response = await fetch(`${baseUrl}/${service}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data || {})
    });

    const result = await response.json();
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };
  } catch (error) {
    console.error('Hawk-Eye API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Failed to contact Hawk-Eye API' })
    };
  }
};

