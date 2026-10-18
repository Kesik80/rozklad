// sw.js — офлайн-кеш «Розкладу»
//
// Стратегія: «спочатку кеш, у фоні оновлюємо» (stale-while-revalidate).
//  • розклад відкривається миттєво і БЕЗ інтернету;
//  • коли онлайн — у фоні тягнемо свіжі файли; якщо html/js/css змінились,
//    шлемо сторінці сигнал → вона показує «Розклад оновлено».
// /api/* ніколи не кешуємо.

const CACHE = 'rozklad-v2';   // змінюй число, щоб скинути старий кеш примусово

const PRECACHE = [
  './', 'index.html', 'pereizd.html', 'tereschky.html', 'otg.html',
  'mykilske.html', 'elektrychky.html',
  'app.css', 'app.js', 'schedule-data.js', 'pwa-install.js', 'splash-screen.js', 'console.js',
  'icons/manifest.json', 'icons/icon-192x192.png', 'icons/favicon.ico'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // по одному: якщо якогось файлу ще нема — інші все одно закешуються
      .then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const TEXTY = /\.(html|js|css|json)$|\/$/;

async function notifyUpdated(url) {
  const list = await self.clients.matchAll({ type: 'window' });
  list.forEach(c => c.postMessage({ type: 'updated', url }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    const network = fetch(req).then(async res => {
      if (res && res.ok && res.type === 'basic') {
        if (cached && TEXTY.test(url.pathname)) {
          const [a, b] = await Promise.all([cached.clone().text(), res.clone().text()]);
          if (a !== b) notifyUpdated(url.pathname);
        }
        await cache.put(req, res.clone());
      }
      return res;
    }).catch(() => null);

    if (cached) { e.waitUntil(network); return cached; }

    const res = await network;
    if (res) return res;
    // офлайн і цього файлу в кеші нема: для сторінок віддаємо головну
    if (req.mode === 'navigate') {
      const home = await cache.match('index.html');
      if (home) return home;
    }
    return Response.error();
  })());
});
