/* Banquet Team — service worker
   Uygulama kabuğunu (bu klasördeki dosyalar) önbelleğe alır: uygulama hızlı açılır ve
   internet yokken "bağlantı yok" ekranı gösterilebilir. Google'daki asıl uygulamaya ait
   istekler önbelleğe alınmaz, her zaman canlı veri gelir.
   Kabuk dosyalarını değiştirdiğinizde SURUM'u artırın. */
/* ---- Telefon bildirimleri (Firebase Cloud Messaging) ---- */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDPnicGdGn7WhXjswl8av-kXqQi7XP-_ho',
  projectId: 'banquet-team-57e79',
  messagingSenderId: '375529452283',
  appId: '1:375529452283:web:4dda255e152cf89caff65e'
});
const messaging = firebase.messaging();

// "notification" içeren mesajları Firebase kendisi gösterir (tekrar göstermeyin, yoksa çift bildirim olur).
// Burası yalnızca sadece-"data" mesajları için.
messaging.onBackgroundMessage(p => {
  if (p.notification) return;
  const d = p.data || {};
  return self.registration.showNotification(d.baslik || 'Banquet Team', {
    body: d.mesaj || '',
    icon: 'icon-192.png',
    data: { link: d.link || './' }
  });
});

// Uygulama açıkken gösterilen (kendi oluşturduğumuz) bildirimlere tıklama.
self.addEventListener('notificationclick', e => {
  const d = e.notification.data || {};
  if (d.FCM_MSG) return; // Firebase'in kendi bildirimi; SDK yönetiyor
  e.notification.close();
  const hedef = new URL(d.link || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(liste => {
    for (const c of liste) if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
    return clients.openWindow(hedef);
  }));
});

/* ---- Önbellek ---- */
const SURUM = 'banquet-team-v9';
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

  // Sayfa (index.html): önce internet — güncellemeler ilk açılışta gelir; internet yoksa önbellek
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res && res.ok) { const k = res.clone(); caches.open(SURUM).then(c => c.put('./index.html', k)); }
      return res;
    }).catch(() => caches.match('./index.html', { cacheName: SURUM })));
    return;
  }
  // Diğer dosyalar (ikonlar vb.): önce önbellek, arkada güncelle
  e.respondWith(caches.open(SURUM).then(async cache => {
    const kayit = await cache.match(req);
    const ag = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => kayit);
    return kayit || ag;
  }));
});
