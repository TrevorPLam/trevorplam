const CACHE_NAME = 'trevor-lam-v1';
const STATIC_ASSETS = [
  '/',
  '/about',
  '/capabilities',
  '/cases',
  '/lab',
  '/resources',
  '/connect',
  '/search',
  '/privacy',
  '/terms',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - serve from cache for assets, network for HTML
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache connect form page
  if (url.pathname === '/connect') {
    return;
  }

  // Cache-first for static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.woff2'))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  } else {
    // Network-first for HTML pages
    event.respondWith(
      fetch(event.request).then((response) => {
        // Clone response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
