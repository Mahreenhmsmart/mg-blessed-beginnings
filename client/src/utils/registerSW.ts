/**
 * Service Worker Registration with Stale-Chunk Prevention
 *
 * - Defers registration until AFTER first paint to avoid blocking page load
 * - Checks for updates on page load and every hour
 * - Auto-activates new service workers without waiting
 * - Clears caches on activation to prevent serving stale HTML/chunks
 */

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  // Defer SW registration until after first paint so it never blocks
  // the critical rendering path. requestAnimationFrame fires before the
  // next repaint; setTimeout(0) pushes execution to the next macrotask,
  // ensuring the browser has completed layout + paint first.
  const deferRegistration = () => {
    requestAnimationFrame(() => {
      setTimeout(registerSWInternal, 0);
    });
  };

  if (document.readyState === 'complete') {
    deferRegistration();
  } else {
    window.addEventListener('load', deferRegistration);
  }
}

async function registerSWInternal(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[SW] Registered:', registration.scope);

    // Immediately check for an updated service worker on page load
    registration.update();

    // If a new SW is already waiting, activate it immediately
    if (registration.waiting) {
      console.log('[SW] New version waiting — activating immediately');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Listen for new service worker becoming available
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      console.log('[SW] Update found, installing…');
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New SW installed while old one still controls the page → activate now
          console.log('[SW] New version installed — sending SKIP_WAITING');
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    // When the new SW takes control, clear old caches and optionally reload
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      console.log('[SW] Controller changed — clearing caches and reloading');
      clearCachesAndReload();
    });

    // Periodic update checks
    setInterval(() => {
      registration.update();
    }, SW_UPDATE_INTERVAL_MS);
  } catch (error) {
    console.error('[SW] Registration failed:', error);
  }
}

async function clearCachesAndReload(): Promise<void> {
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
  } catch {
    // Best-effort
  }
  window.location.reload();
}
