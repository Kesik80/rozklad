// sw.js — офлайн-кеш «Розкладу»
//
// Стратегія: «спочатку мережа, кеш — запасний варіант».
//  • є інтернет → завжди беремо СВІЖІ файли (нове розкладання видно одразу);
//  • інтернету нема або він дуже повільний (понад 2.5 с) → віддаємо кеш,
//    тож розклад відкривається й офлайн;
//  • якщо віддали кеш, а свіжа версія пізніше прийшла іншою → сторінка
//    показує «Розклад оновлено — торкніться».
// /api/* ніколи не кешуємо.

const CACHE = 'rozklad-v3';   // змінюй число, щоб примусово скинути старий кеш у всіх
const NET_TIMEOUT = 2500;     // мс очікування мережі, потім — кеш

const PRECACHE = [
  './', 'index.html', 'pereizd.html', 'tereschky.html', 'otg.html',
  'mykilske.html', 'elektrychky.html', 'mynivka.html', 'kashubivka.html', 'vovkivka.html',
  'verkholy.html', 'golovach.html', 'info.html',
  'app.css', 'app.js', 'schedule-data.js', 'pwa-install.js', 'splash-screen.js', 'console.js',
  'icons/manifest.json', 'icons/icon-192x192.png', 'icons/favicon.ico'
];

async function broadcast(msg) {
  const list = await self.clients.matchAll({ type: 'window' });
  list.forEach(c => c.postMessage(msg));
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:'reload' — тягнемо з сервера, а не з HTTP-кешу браузера;
      // по одному: якщо якогось файлу ще нема — інші все одно закешуються
      .then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const old = keys.filter(k => k !== CACHE);
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    // була стара версія → відкриті сторінки показують старе, кажемо їм про оновлення
    if (old.length) await broadcast({ type: 'updated' });
  })());
});

const TEXTY = /\.(html|js|css|json)$|\/$/;

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    let servedCache = false;

    const network = fetch(req, { cache: 'no-cache' }).then(async res => {
      if (res && res.ok && res.type === 'basic') {
        if (servedCache && cached && TEXTY.test(url.pathname)) {
          const [a, b] = await Promise.all([cached.clone().text(), res.clone().text()]);
          if (a !== b) broadcast({ type: 'updated', url: url.pathname });
        }
        await cache.put(req, res.clone());
      }
      return res;
    }).catch(() => null);

    if (cached) {
      const timer = new Promise(r => setTimeout(() => r('timeout'), NET_TIMEOUT));
      const first = await Promise.race([network, timer]);
      if (first && first !== 'timeout') return first;
      servedCache = true;
      e.waitUntil(network);
      return cached;
    }

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
