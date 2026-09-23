/* Banquet Team — service worker
   Uygulama kabuğunu (bu klasördeki dosyalar) önbelleğe alır: uygulama hızlı açılır ve
   internet yokken "bağlantı yok" ekranı gösterilebilir. Google'daki asıl uygulamaya ait
   istekler önbelleğe alınmaz, her zaman canlı veri gelir.
   Kabuk dosyalarını değiştirdiğinizde SURUM'u artırın. */
const SURUM = 'banquet-team-v3';
const KABUK = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon.png', './logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Google istekleri: dokunma

  // Önce önbellek, arkada güncelle (stale-while-revalidate)
  e.respondWith(caches.open(SURUM).then(async cache => {
    const kayit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    const ag = fetch(req).then(res => {
      if (res && res.ok) cache.put(req.mode === 'navigate' ? './index.html' : req, res.clone());
      return res;
    }).catch(() => kayit || cache.match('./index.html'));
    return kayit || ag;
  }));
});
