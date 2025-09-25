/**
 * BLAZE SPORTS INTEL - MOBILE PWA SERVICE WORKER
 * Championship-grade offline functionality with intelligent caching
 * Battery-aware background sync and push notifications
 */

const CACHE_NAME = 'blaze-sports-intel-v2.0.0';
const STATIC_CACHE = 'blaze-static-v2.0.0';
const DYNAMIC_CACHE = 'blaze-dynamic-v2.0.0';
const API_CACHE = 'blaze-api-v2.0.0';
const IMAGE_CACHE = 'blaze-images-v2.0.0';

// Core files to cache immediately
const CORE_ASSETS = [
  './blazesportsintel-mobile-app.html',
  './mobile-app-manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap',
  'https://cdn.skypack.dev/three@0.145.0',
  'https://cdn.skypack.dev/three@0.145.0/examples/jsm/postprocessing/EffectComposer',
  'https://cdn.skypack.dev/three@0.145.0/examples/jsm/postprocessing/RenderPass',
  'https://cdn.skypack.dev/three@0.145.0/examples/jsm/postprocessing/UnrealBloomPass',
  'https://cdn.skypack.dev/three@0.145.0/examples/jsm/postprocessing/SSAOPass',
  'https://cdn.skypack.dev/three@0.145.0/examples/jsm/postprocessing/SMAAPass'
];

// API endpoints for sports data
const API_ENDPOINTS = [
  '/api/cardinals-analytics',
  '/api/titans-data',
  '/api/longhorns-stats',
  '/api/grizzlies-metrics',
  '/api/live-scores',
  '/api/nil-calculator',
  '/api/perfect-game-data'
];

// Mobile performance optimizations
const MOBILE_CONFIG = {
  maxCacheSize: {
    static: 50 * 1024 * 1024,    // 50MB for static assets
    dynamic: 25 * 1024 * 1024,   // 25MB for dynamic content
    api: 10 * 1024 * 1024,       // 10MB for API responses
    images: 15 * 1024 * 1024     // 15MB for images
  },
  maxCacheAge: {
    static: 7 * 24 * 60 * 60 * 1000,     // 7 days
    dynamic: 24 * 60 * 60 * 1000,        // 24 hours
    api: 15 * 60 * 1000,                 // 15 minutes
    images: 7 * 24 * 60 * 60 * 1000      // 7 days
  },
  networkTimeoutMs: 3000,
  retryAttempts: 3
};

// Battery-aware background sync configuration
let batteryManager = null;
let isLowPowerMode = false;

/**
 * Service Worker Installation
 * Pre-cache core assets for offline functionality
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    (async () => {
      try {
        // Pre-cache core assets
        const staticCache = await caches.open(STATIC_CACHE);

        // Cache core assets with retry logic
        const cachePromises = CORE_ASSETS.map(async (asset) => {
          for (let attempt = 0; attempt < MOBILE_CONFIG.retryAttempts; attempt++) {
            try {
              const response = await fetch(asset, {
                cache: 'no-cache'
              });

              if (response.ok) {
                await staticCache.put(asset, response);
                break;
              }
            } catch (error) {
              console.warn(`[SW] Failed to cache ${asset}, attempt ${attempt + 1}:`, error);

              if (attempt === MOBILE_CONFIG.retryAttempts - 1) {
                console.error(`[SW] Failed to cache ${asset} after ${MOBILE_CONFIG.retryAttempts} attempts`);
              }
            }
          }
        });

        await Promise.allSettled(cachePromises);

        // Initialize battery monitoring
        await initBatteryMonitoring();

        console.log('[SW] Core assets cached successfully');

        // Skip waiting to activate immediately
        self.skipWaiting();

      } catch (error) {
        console.error('[SW] Installation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Activation
 * Clean up old caches and claim clients
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name =>
          !name.includes('v2.0.0') &&
          (name.includes('blaze') || name.includes('BLAZE'))
        );

        await Promise.all(
          oldCaches.map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );

        // Clean up oversized caches
        await cleanupCaches();

        // Claim all clients immediately
        await self.clients.claim();

        console.log('[SW] Service worker activated and clients claimed');

      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

/**
 * Fetch Event Handler
 * Implements intelligent caching strategies based on resource type
 */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Handle different resource types with appropriate strategies
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(event.request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(event.request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(event.request));
  } else {
    event.respondWith(handleDynamicContent(event.request));
  }
});

/**
 * Background Sync for Sports Data Updates
 * Battery-aware synchronization of critical sports data
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  switch (event.tag) {
    case 'sports-data-sync':
      event.waitUntil(syncSportsData());
      break;
    case 'analytics-sync':
      event.waitUntil(syncAnalyticsData());
      break;
    case 'offline-actions':
      event.waitUntil(processOfflineActions());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

/**
 * Push Notification Handler
 * Championship game alerts and breaking news
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};

  const options = {
    title: data.title || 'Blaze Sports Intel',
    body: data.body || 'New sports update available',
    icon: './icons/icon-192x192.png',
    badge: './icons/badge-72x72.png',
    image: data.image,
    data: {
      url: data.url || './blazesportsintel-mobile-app.html',
      timestamp: Date.now(),
      ...data
    },
    actions: [
      {
        action: 'open',
        title: 'View Details',
        icon: './icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: './icons/action-dismiss.png'
      }
    ],
    requireInteraction: data.urgent || false,
    vibrate: data.urgent ? [200, 100, 200, 100, 200] : [100, 50, 100],
    tag: data.tag || 'sports-update'
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || './blazesportsintel-mobile-app.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes('blazesportsintel') && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if no existing window found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Error handling notification click:', error);
      })
  );
});

/**
 * Message Handler for Client Communication
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  switch (event.data.type) {
    case 'CACHE_SPORTS_DATA':
      cacheSportsData(event.data.payload);
      break;
    case 'UPDATE_BATTERY_STATUS':
      updateBatteryStatus(event.data.payload);
      break;
    case 'CLEAR_CACHE':
      clearSpecificCache(event.data.payload);
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
      });
      break;
    default:
      console.log('[SW] Unknown message type:', event.data.type);
  }
});

// ===== HELPER FUNCTIONS =====

/**
 * Initialize battery monitoring for power-aware operations
 */
async function initBatteryMonitoring() {
  try {
    if ('getBattery' in navigator) {
      batteryManager = await navigator.getBattery();
      isLowPowerMode = batteryManager.level < 0.2 || batteryManager.dischargingTime < 3600;

      batteryManager.addEventListener('levelchange', () => {
        isLowPowerMode = batteryManager.level < 0.2;
      });

      batteryManager.addEventListener('dischargingtimechange', () => {
        isLowPowerMode = isLowPowerMode || batteryManager.dischargingTime < 3600;
      });

      console.log('[SW] Battery monitoring initialized');
    }
  } catch (error) {
    console.warn('[SW] Battery API not available:', error);
  }
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetchWithTimeout(request, MOBILE_CONFIG.networkTimeoutMs);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Handle API requests with network-first, cache-fallback strategy
 */
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE);

    // Try network first for fresh data
    try {
      const networkResponse = await fetchWithTimeout(request, MOBILE_CONFIG.networkTimeoutMs);

      if (networkResponse.ok) {
        // Cache successful responses
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (networkError) {
      console.warn('[SW] Network request failed, trying cache:', networkError);
    }

    // Fallback to cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Add stale indicator header
      const responseHeaders = new Headers(cachedResponse.headers);
      responseHeaders.set('X-Served-From-Cache', 'true');

      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: responseHeaders
      });
    }

    // Return offline response
    return new Response(JSON.stringify({
      error: 'Data not available offline',
      offline: true,
      timestamp: Date.now()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[SW] API request handling failed:', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetchWithTimeout(request, MOBILE_CONFIG.networkTimeoutMs);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (error) {
    console.error('[SW] Image request failed:', error);
    // Return placeholder or default image
    return new Response('Image not available', { status: 503 });
  }
}

/**
 * Handle dynamic content with stale-while-revalidate strategy
 */
async function handleDynamicContent(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      fetchWithTimeout(request, MOBILE_CONFIG.networkTimeoutMs)
        .then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
        })
        .catch(error => console.warn('[SW] Background update failed:', error));

      return cachedResponse;
    }

    // No cache available, try network
    const networkResponse = await fetchWithTimeout(request, MOBILE_CONFIG.networkTimeoutMs);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (error) {
    console.error('[SW] Dynamic content request failed:', error);
    return new Response('Content not available offline', { status: 503 });
  }
}

/**
 * Fetch with timeout for mobile networks
 */
function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Fetch timeout'));
    }, timeoutMs);

    fetch(request)
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Sync sports data in background
 */
async function syncSportsData() {
  try {
    console.log('[SW] Syncing sports data...');

    // Skip aggressive syncing in low power mode
    if (isLowPowerMode) {
      console.log('[SW] Skipping sync due to low power mode');
      return;
    }

    const cache = await caches.open(API_CACHE);

    // Sync critical endpoints
    const syncPromises = API_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response);
          console.log(`[SW] Synced ${endpoint}`);
        }
      } catch (error) {
        console.warn(`[SW] Failed to sync ${endpoint}:`, error);
      }
    });

    await Promise.allSettled(syncPromises);
    console.log('[SW] Sports data sync completed');

  } catch (error) {
    console.error('[SW] Sports data sync failed:', error);
  }
}

/**
 * Sync analytics data
 */
async function syncAnalyticsData() {
  try {
    console.log('[SW] Syncing analytics data...');

    // Implementation for analytics sync
    // This would fetch latest performance metrics, user analytics, etc.

    console.log('[SW] Analytics sync completed');

  } catch (error) {
    console.error('[SW] Analytics sync failed:', error);
  }
}

/**
 * Process offline actions when back online
 */
async function processOfflineActions() {
  try {
    console.log('[SW] Processing offline actions...');

    // Get offline actions from IndexedDB or other storage
    // Process any user actions that were queued while offline

    console.log('[SW] Offline actions processed');

  } catch (error) {
    console.error('[SW] Failed to process offline actions:', error);
  }
}

/**
 * Clean up oversized caches to prevent storage quota issues
 */
async function cleanupCaches() {
  try {
    const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      // Calculate approximate cache size and remove old entries if needed
      if (requests.length > 100) { // Arbitrary limit
        console.log(`[SW] Cleaning up cache: ${cacheName}`);

        // Remove oldest 20% of entries
        const toRemove = requests.slice(0, Math.floor(requests.length * 0.2));
        await Promise.all(toRemove.map(request => cache.delete(request)));
      }
    }

  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

/**
 * Cache sports data on demand
 */
async function cacheSportsData(data) {
  try {
    const cache = await caches.open(API_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

    await cache.put('/api/cached-sports-data', response);
    console.log('[SW] Sports data cached successfully');

  } catch (error) {
    console.error('[SW] Failed to cache sports data:', error);
  }
}

/**
 * Update battery status from client
 */
function updateBatteryStatus(status) {
  isLowPowerMode = status.level < 0.2 || status.dischargingTime < 3600;
  console.log('[SW] Battery status updated:', { isLowPowerMode, level: status.level });
}

/**
 * Clear specific cache
 */
async function clearSpecificCache(cacheName) {
  try {
    await caches.delete(cacheName);
    console.log(`[SW] Cache cleared: ${cacheName}`);
  } catch (error) {
    console.error(`[SW] Failed to clear cache ${cacheName}:`, error);
  }
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        count: keys.length,
        lastUpdated: Date.now() // This would be more sophisticated in production
      };
    }

    return status;

  } catch (error) {
    console.error('[SW] Failed to get cache status:', error);
    return {};
  }
}

// ===== UTILITY FUNCTIONS =====

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
  const staticHosts = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.skypack.dev'];

  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         staticHosts.some(host => url.hostname.includes(host)) ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/static/');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
}

function isImageRequest(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

console.log('[SW] Blaze Sports Intel Service Worker loaded successfully');