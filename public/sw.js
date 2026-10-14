// Service Worker per Pizzeria Smart Pro - Funzionamento 100% Offline e Mobile-First
const CACHE_NAME = 'pizzeria-smart-cache-v10-mobile-optimized';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pizza.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Salta richieste API e WebSocket
  if (event.request.url.includes('/socket.io') || event.request.url.includes('/api/')) {
    return;
  }

  // Network-First per tutte le richieste: prova la rete per avere sempre l'ultima versione,
  // se offline o errore rete, fa fallback alla cache locale
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate' || event.request.url.endsWith('index.html')) {
            return caches.match('/index.html');
          }
          return null;
        });
      })
  );
});
