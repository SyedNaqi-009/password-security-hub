/**
 * Password Security Hub — Service Worker (psh-v1)
 * Cache-first for static assets, network-first for HTML pages
 * Provides full offline support
 */

const CACHE_NAME = 'psh-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/global.css',
  '/assets/css/components.css',
  '/assets/css/layout.css',
  '/assets/css/themes.css',
  '/assets/js/app.js',
  '/assets/js/utils/crypto.js',
  '/assets/js/utils/clipboard.js',
  '/assets/js/utils/toast.js',
  '/assets/js/utils/export.js',
  '/assets/js/utils/strength.js',
  '/assets/js/lib/zxcvbn.min.js',
  '/assets/js/lib/md5.min.js',
  '/assets/js/tools/password-generator.js',
  '/assets/js/tools/strength-checker.js',
  '/assets/js/tools/passphrase-generator.js',
  '/assets/js/tools/pin-generator.js',
  '/assets/js/tools/username-generator.js',
  '/assets/js/tools/entropy-calculator.js',
  '/assets/js/tools/policy-checker.js',
  '/assets/js/tools/hash-generator.js',
  '/assets/js/tools/bulk-generator.js',
  '/assets/js/tools/security-code-generator.js',
  '/assets/data/eff-wordlist.json',
  '/assets/data/common-passwords.json',
  '/assets/data/adjectives.json',
  '/assets/data/nouns.json',
  '/pages/password-generator.html',
  '/pages/password-strength-checker.html',
  '/pages/passphrase-generator.html',
  '/pages/pin-generator.html',
  '/pages/username-generator.html',
  '/pages/password-entropy-calculator.html',
  '/pages/password-policy-checker.html',
  '/pages/hash-generator.html',
  '/pages/bulk-password-generator.html',
  '/pages/security-code-generator.html',
  '/pages/about.html',
  '/pages/privacy-policy.html',
  '/pages/terms-of-service.html',
  '/pages/contact.html',
  '/pages/faq.html',
  '/404.html'
];

// Install: Cache all essential core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Non-fatal SW pre-cache miss:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy dispatch
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // External APIs or analytics: network only
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML navigation requests: Network-First with Cache Fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html') || caches.match('/404.html');
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, JSON, Fonts, Images): Cache-First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
