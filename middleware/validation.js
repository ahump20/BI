/**
 * Input Validation Middleware
 * Provides secure input validation and sanitization for all API endpoints
 */

import logger from '../utils/logger.js';

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate team ID (numeric)
 */
export function isValidTeamId(teamId) {
  const id = parseInt(teamId);
  return !isNaN(id) && id > 0 && id < 10000;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate JSON payload size
 */
export function validatePayloadSize(data, maxSizeKB = 100) {
  const size = JSON.stringify(data).length / 1024;
  return size <= maxSizeKB;
}

/**
 * Generic request validator middleware
 */
export function validateRequest(schema) {
  return async (request, env, ctx) => {
    try {
      const contentType = request.headers.get('content-type');
      
      // Validate content type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        if (!contentType?.includes('application/json')) {
          return new Response(
            JSON.stringify({ error: 'Content-Type must be application/json' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Parse and validate request body
      let body;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          body = await request.json();
          
          // Check payload size
          if (!validatePayloadSize(body, 500)) {
            return new Response(
              JSON.stringify({ error: 'Request payload too large' }),
              { status: 413, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Validate against schema if provided
      if (schema && body) {
        const errors = validateSchema(body, schema);
        if (errors.length > 0) {
          logger.logSecurityEvent('Invalid request payload', { errors });
          return new Response(
            JSON.stringify({ error: 'Validation failed', details: errors }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Attach validated body to request
      request.validatedBody = body;
      
      return null; // Continue to next middleware
    } catch (error) {
      logger.logError(error, { middleware: 'validateRequest' });
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Validate data against schema
 */
function validateSchema(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is optional and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }
    
    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }
    
    // String validations
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      if (rules.email && !isValidEmail(value)) {
        errors.push(`${field} must be a valid email address`);
      }
    }
    
    // Number validations
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }
    
    // Array validations
    if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }
      if (rules.minItems && value.length < rules.minItems) {
        errors.push(`${field} must have at least ${rules.minItems} items`);
      }
      if (rules.maxItems && value.length > rules.maxItems) {
        errors.push(`${field} must have at most ${rules.maxItems} items`);
      }
    }
    
    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      errors.push(`${field} validation failed`);
    }
  }
  
  return errors;
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // 100 requests per window
    keyGenerator = (req) => req.headers.get('cf-connecting-ip') || 'anonymous'
  } = options;
  
  // Note: This is a basic implementation. 
  // For production, use Cloudflare's built-in rate limiting or a distributed cache
  const requestCounts = new Map();
  
  return async (request) => {
    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [k, timestamps] of requestCounts.entries()) {
      requestCounts.set(k, timestamps.filter(t => t > windowStart));
      if (requestCounts.get(k).length === 0) {
        requestCounts.delete(k);
      }
    }
    
    // Get current count
    const timestamps = requestCounts.get(key) || [];
    
    if (timestamps.length >= max) {
      logger.logSecurityEvent('Rate limit exceeded', { key, count: timestamps.length });
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(windowMs / 1000).toString()
          }
        }
      );
    }
    
    // Add current timestamp
    timestamps.push(now);
    requestCounts.set(key, timestamps);
    
    return null; // Continue
  };
}

/**
 * CORS middleware
 */
export function cors(options = {}) {
  const {
    origin = '*',
    methods = 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders = 'Content-Type,Authorization',
    credentials = false
  } = options;
  
  return async (request) => {
    const headers = new Headers();
    
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', methods);
    headers.set('Access-Control-Allow-Headers', allowedHeaders);
    
    if (credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    
    return headers; // Return headers to be merged with response
  };
}

export default {
  validateRequest,
  rateLimit,
  cors,
  sanitizeInput,
  isValidEmail,
  isValidTeamId,
  isValidDate,
  validatePayloadSize
};
