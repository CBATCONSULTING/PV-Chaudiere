/* DECIF Pré-visite — fonctionnement hors ligne.
   À chaque mise à jour du questionnaire, changer VERSION pour que les téléphones récupèrent la nouvelle version. */
const VERSION = 'decif-previsite-v19-2026-10-28';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pdf-lib.min.js',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './entete_decif.jpg',
  './logos_decif.jpg',
  './visa_qualite_habitation.pdf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Page du questionnaire : réseau d'abord (pour avoir la dernière version), sinon la copie du téléphone.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Autres fichiers : copie du téléphone d'abord, réseau sinon.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req))
  );
});
