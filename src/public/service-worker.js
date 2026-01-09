// SPREDfit Service Worker for PWA
const CACHE_NAME = 'spredfit-v1';
const RUNTIME_CACHE = 'spredfit-runtime-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add your critical CSS and JS files here
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('âœ… Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('í³¦ Caching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('âœ… Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('í·‘ï¸ Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network only (always fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network first, fallback to cache strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the fetched response
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/').then(response => response || new Response('Offline', { status: 503 }));
          }
          
          // Return a proper response for failed requests
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        }).catch(() => {
          // Fallback if cache also fails
          return new Response('Service Unavailable', { status: 503 });
        });
      })
  );
});

// Background sync for offline workout logging (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_WORKOUTS',
          });
        });
      })
    );
  }
});
