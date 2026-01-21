/* Datei: sw.js */
const CACHE_NAME = 'gastromaster-v5';

// Installieren und sofort aktivieren
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Kontrolle übernehmen
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch Events (Offline Fallback Basis)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Du bist offline. Bitte Internet prüfen.");
    })
  );
});