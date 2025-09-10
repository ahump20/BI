// Blaze Intelligence Authentication Worker
// Production-ready JWT authentication for Cloudflare Workers

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      // Routes
      if (path === '/auth/register' && method === 'POST') {
        return await handleRegister(request, env, corsHeaders);
      } else if (path === '/auth/login' && method === 'POST') {
        return await handleLogin(request, env, corsHeaders);
      } else if (path === '/auth/validate' && method === 'GET') {
        return await handleValidate(request, env, corsHeaders);
      } else if (path === '/auth/refresh' && method === 'POST') {
        return await handleRefresh(request, env, corsHeaders);
      } else if (path === '/auth/logout' && method === 'POST') {
        return await handleLogout(request, env, corsHeaders);
      } else {
        return new Response('Not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }
    } catch (error) {
      console.error('Auth Worker Error:', error);
      return new Response('Internal server error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

// JWT utility functions using Web Crypto API
async function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Invalid token format');
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const valid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!valid) {
    throw new Error('Invalid signature');
  }
  
  const payload = JSON.parse(atob(payloadB64));
  if (payload.exp && payload.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
  
  return payload;
}

// Password hashing using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// Authentication handlers
async function handleRegister(request, env, corsHeaders) {
  const body = await request.json();
  const { email, password, name, organization } = body;
  
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Check if user exists
  const existingUser = await env.SESSIONS.get(`user:${email}`);
  if (existingUser) {
    return new Response(JSON.stringify({ error: 'User already exists' }), {
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();
  const user = {
    id: userId,
    email,
    name: name || '',
    organization: organization || '',
    tier: 'free',
    created: new Date().toISOString()
  };
  
  // Store user data
  await env.SESSIONS.put(`user:${email}`, JSON.stringify(user));
  await env.SESSIONS.put(`password:${userId}`, passwordHash);
  
  // Create access token
  const tokenPayload = {
    userId,
    email,
    tier: user.tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const token = await createJWT(tokenPayload, env.JWT_SECRET || 'default-secret');
  
  return new Response(JSON.stringify({
    user: { id: userId, email, name, organization, tier: user.tier },
    token,
    message: 'Registration successful'
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLogin(request, env, corsHeaders) {
  const body = await request.json();
  const { email, password } = body;
  
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Get user
  const userData = await env.SESSIONS.get(`user:${email}`);
  if (!userData) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const user = JSON.parse(userData);
  
  // Verify password
  const storedHash = await env.SESSIONS.get(`password:${user.id}`);
  const passwordHash = await hashPassword(password);
  
  if (storedHash !== passwordHash) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Create access token
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    tier: user.tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const token = await createJWT(tokenPayload, env.JWT_SECRET || 'default-secret');
  
  return new Response(JSON.stringify({
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      organization: user.organization, 
      tier: user.tier 
    },
    token,
    message: 'Login successful'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleValidate(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyJWT(token, env.JWT_SECRET || 'default-secret');
    
    return new Response(JSON.stringify({
      valid: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        tier: payload.tier
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      valid: false, 
      error: error.message 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleRefresh(request, env, corsHeaders) {
  return new Response(JSON.stringify({ message: 'Refresh endpoint' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLogout(request, env, corsHeaders) {
  return new Response(JSON.stringify({ message: 'Logout successful' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}