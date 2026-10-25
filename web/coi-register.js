/*
 * Registriert den Service Worker (coi-sw.js) und lädt die Seite einmal neu,
 * sobald er aktiv ist. Danach ist die Seite „cross-origin isolated“.
 */
(function () {
  if (window.crossOriginIsolated || !('serviceWorker' in navigator)) return;
  var base = document.currentScript.getAttribute('data-base') || '/';
  var key = 'luzidio-coi-reload';
  navigator.serviceWorker.register(base + 'coi-sw.js', { scope: base }).then(
    function (registration) {
      function reloadOnce() {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
      if (registration.active && !navigator.serviceWorker.controller) reloadOnce();
      navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);
    },
    function (err) {
      console.error('Service Worker konnte nicht registriert werden', err);
    },
  );
})();
