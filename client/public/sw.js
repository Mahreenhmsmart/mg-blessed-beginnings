/**
 * Service Worker — Stale-Chunk Prevention Build
 *
 * KEY DESIGN DECISIONS:
 * - NEVER caches index.html or navigation requests (mode === 'navigate')
 * - NEVER serves stale HTML from cache
 * - Version constant forces cache invalidation on each deploy
 * - Handles SKIP_WAITING message for immediate activation
 * - Only caches versioned static assets (JS/CSS with content hashes)
 */

// Bump this on every deploy to force old SWs to be replaced
const CACHE_VERSION = 'v5-clean-rebuild';
const CACHE_NAME = `mg-blessed-${CACHE_VERSION}`;
const MAX_CACHE_ENTRIES = 80;

// ── Message handler — listen for SKIP_WAITING from the registration script ────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Install — skip waiting immediately, don't pre-cache HTML ────────────────────
self.addEventListener('install', (event) => {
  // Don't pre-cache index.html or any HTML — those must always come from network
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache non-HTML static assets that are safe to cache
      return cache.addAll(['/manifest.json']);
    }).catch(() => {
      // Non-fatal — manifest may not exist in all builds
    })
  );
  self.skipWaiting();
});

// ── Activate — aggressively clear ALL old caches ───────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Check if a URL path is a versioned asset (Vite content-hash filenames) */
function isVersionedAsset(urlPath) {
  return /\.[a-f0-9]{8}\.(js|css)$/.test(urlPath);
}

/** Determine if a response is safe to cache */
function isCacheableResponse(response) {
  if (!response || response.status !== 200) return false;
  if (response.type === 'opaque') return false;
  if (response.redirected) return false;
  return true;
}

/** Trim cache to prevent unbounded growth */
async function trimCache(cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > MAX_CACHE_ENTRIES) {
      const excess = keys.length - MAX_CACHE_ENTRIES;
      for (let i = 0; i < excess; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch {
    // Non-fatal
  }
}

// ── Fetch — network-only for HTML, cache-first for versioned assets ─────────────
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests entirely
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);

  // ── HTML / Navigation: NETWORK ONLY — never cache, never serve stale ──────
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Offline fallback: return a minimal offline page rather than stale HTML
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
          '<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#111;color:#eee">' +
          '<div style="text-align:center"><h1>You are offline</h1><p>Please check your connection and reload.</p></div>' +
          '</body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // ── Versioned JS/CSS chunks: Network-first with cache fallback ──────────
  if (isVersionedAsset(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (isCacheableResponse(response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              trimCache(CACHE_NAME);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // ── Other static assets (images, fonts): Stale-while-revalidate ──────────
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        const fetchPromise = fetch(event.request).then((response) => {
          if (isCacheableResponse(response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              trimCache(CACHE_NAME);
            });
          }
          return response;
        }).catch(() => null);

        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (isCacheableResponse(response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              trimCache(CACHE_NAME);
            });
          }
          return response;
        })
        .catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
