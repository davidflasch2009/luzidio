/*
 * Service Worker für die Web-Version von Luzidio.
 * Die Browser-Datenbank (expo-sqlite, wa-sqlite) benötigt SharedArrayBuffer und damit
 * „Cross-Origin Isolation“. GitHub Pages kann die dafür nötigen HTTP-Header nicht setzen,
 * deshalb ergänzt dieser Service Worker sie für alle Antworten der eigenen Seite.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;
  event.respondWith(
    fetch(request).then((response) => {
      if (response.status === 0) return response;
      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }),
  );
});
