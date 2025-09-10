/**
 * API Configuration for Blaze Vision AI Coach UI
 * Connects to live edge gateway
 */

export const API_CONFIG = {
  // Production gateway endpoint
  GATEWAY_URL: 'https://blaze-vision-ai-gateway.humphrey-austin20.workers.dev',
  
  // Development fallback
  DEV_GATEWAY_URL: 'http://localhost:8787',
  
  // Endpoints
  ENDPOINTS: {
    HEALTH: '/healthz',
    SESSION_START: '/vision/sessions',
    TELEMETRY: '/vision/telemetry',
    SCORES: '/vision/session/:sessionId/scores',
    STATUS: '/vision/session/:sessionId/status',
    STREAM: '/vision/session/:sessionId/stream',
    EVENT: '/vision/event',
    CUE: '/vision/cue',
    MODELS: '/vision/models'
  },
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Dev-Mode': 'true', // Remove for production
  },
  
  // WebSocket config
  WS_RECONNECT_ATTEMPTS: 5,
  WS_RECONNECT_DELAY: 2000,
  
  // Performance targets
  MAX_LATENCY_MS: 150,
  TARGET_FPS: 60
} as const;

export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;

export const getGatewayUrl = (): string => {
  // Use development URL if localhost is available, otherwise production
  return process.env.NODE_ENV === 'development' 
    ? API_CONFIG.DEV_GATEWAY_URL 
    : API_CONFIG.GATEWAY_URL;
};

export const buildEndpointUrl = (endpoint: ApiEndpoint, params?: Record<string, string>): string => {
  const baseUrl = getGatewayUrl();
  let path = API_CONFIG.ENDPOINTS[endpoint];
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  
  return `${baseUrl}${path}`;
};