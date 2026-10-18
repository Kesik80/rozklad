/* pwa-install.js — реєстрація service worker + пропозиція встановити додаток.
   Підключається на кожній сторінці (викликається з app.js: PWAInstall.init()).
   Банер показується лише там, де <body data-install="banner"> (головна).

   Android/Chrome — нативний діалог (beforeinstallprompt);
   браузери без нього та iOS Safari — коротка інструкція.
   Колір банера бере тему додатка (світла/темна).

   Налагодження через console.js:
     localStorage.removeItem('pwa-install-dismissed')  — повернути банер
     localStorage.setItem('pwa-install-debug','1')     — показувати завжди
*/
(function () {
  'use strict';
  function log() { try { console.log.apply(console, ['[pwa]'].concat([].slice.call(arguments))); } catch (e) {} }

  function init(opts) {
    opts = opts || {};
    var appName = opts.appName || document.title;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(opts.swPath || '/sw.js', { scope: '/' })
        .then(function () { log('service worker готовий'); })
        .catch(function (e) { log('service worker не встав:', e.message); });
    }
    if (document.body.dataset.install !== 'banner') return;

    var DEBUG = false;
    try { DEBUG = localStorage.getItem('pwa-install-debug') === '1'; } catch (e) {}

    var standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || window.navigator.standalone === true;
    if (standalone && !DEBUG) { log('вже встановлено'); return; }

    var KEY = 'pwa-install-dismissed', WEEK = 7 * 24 * 60 * 60 * 1000;
    if (!DEBUG) {
      try {
        var d = parseInt(localStorage.getItem(KEY), 10);
        if (d && Date.now() - d < WEEK) { log('банер закритий, ще днів: ' + Math.ceil((WEEK - (Date.now() - d)) / 86400000)); return; }
      } catch (e) {}
    }

    /* ---------- стилі (кольори — з теми додатка) ---------- */
    var css = document.createElement('style');
    css.textContent = [
      '.pwa-bar{position:fixed;left:12px;right:12px;z-index:9000;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);',
      ' display:none;align-items:center;gap:12px;box-sizing:border-box;max-width:500px;margin:0 auto;',
      ' background:var(--bg-1,#fff);color:var(--label,#000);border:1px solid var(--separator,#ccc);border-radius:18px;',
      ' padding:12px 14px;box-shadow:0 10px 34px rgba(0,0,0,.3);font-family:var(--font,sans-serif);',
      ' transform:translateY(160%);transition:transform .42s cubic-bezier(.32,1,.23,1);}',
      '.pwa-bar.show{display:flex;transform:translateY(0);}',
      'body.pwa-open{padding-bottom:var(--pwa-space,120px)!important;transition:padding-bottom .42s cubic-bezier(.32,1,.23,1);}',
      '.pwa-ic{flex:none;font-size:28px;line-height:1;}',
      '.pwa-tx{flex:1;min-width:0;}',
      '.pwa-t{font-size:15px;font-weight:700;line-height:1.25;}',
      '.pwa-s{font-size:12px;color:var(--label-2,#666);margin-top:2px;line-height:1.3;font-weight:500;}',
      '.pwa-go{flex:none;padding:9px 15px;border:0;border-radius:12px;background:var(--accent,#0066d6);color:var(--accent-text,#fff);',
      ' font:700 13px var(--font,sans-serif);cursor:pointer;}',
      '.pwa-x{flex:none;width:28px;height:28px;border:0;background:none;color:var(--label-2,#666);font-size:16px;cursor:pointer;}',
      '.pwa-ov{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.62);display:flex;align-items:flex-end;',
      ' justify-content:center;padding:14px;box-sizing:border-box;font-family:var(--font,sans-serif);}',
      '.pwa-sheet{background:var(--bg-1,#fff);color:var(--label,#000);border-radius:22px;padding:22px;width:100%;max-width:480px;box-sizing:border-box;}',
      '.pwa-sheet h3{font-size:17px;font-weight:700;text-align:center;margin:0 0 18px;}',
      '.pwa-step{display:flex;align-items:center;gap:12px;margin-bottom:13px;font-size:14.5px;line-height:1.35;font-weight:500;}',
      '.pwa-n{width:32px;height:32px;flex:none;border-radius:10px;background:var(--accent,#0066d6);color:var(--accent-text,#fff);',
      ' display:grid;place-items:center;font-weight:700;font-size:14px;}',
      '.pwa-ok{width:100%;margin-top:8px;padding:13px;border:0;border-radius:14px;background:var(--accent,#0066d6);',
      ' color:var(--accent-text,#fff);font:700 15px var(--font,sans-serif);cursor:pointer;}'
    ].join('\n');
    document.head.appendChild(css);

    /* ---------- банер ---------- */
    var bar = document.createElement('div');
    bar.className = 'pwa-bar';
    bar.innerHTML =
      '<div class="pwa-ic">📲</div>' +
      '<div class="pwa-tx"><div class="pwa-t">Встановити «' + appName + '»</div>' +
      '<div class="pwa-s" id="pwa-sub">Додати на головний екран</div></div>' +
      '<button class="pwa-go" id="pwa-go" type="button">Встановити</button>' +
      '<button class="pwa-x" id="pwa-x" type="button" aria-label="Закрити">✕</button>';
    document.body.appendChild(bar);

    function $(id) { return document.getElementById(id); }
    function show() {
      requestAnimationFrame(function () {
        bar.classList.add('show');
        requestAnimationFrame(function () {
          document.body.style.setProperty('--pwa-space', ((bar.offsetHeight || 62) + 30) + 'px');
          document.body.classList.add('pwa-open');
        });
      });
    }
    function hide() { bar.classList.remove('show'); document.body.classList.remove('pwa-open'); }

    $('pwa-x').onclick = function () {
      hide();
      try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    };

    var ua = navigator.userAgent;
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      var isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|opios|chrome/i.test(ua);
      if (!isSafari && !DEBUG) return;   // на iPhone встановити можна лише з Safari
      $('pwa-sub').textContent = 'Через кнопку «Поділитися» в Safari';
      $('pwa-go').textContent = 'Як?';
      $('pwa-go').onclick = function () { guide('ios'); };
      setTimeout(show, 2000);
      return;
    }

    /* ---------- Android / Chrome ---------- */
    var deferred = null, fired = false;

    function usePrompt(e) {
      if (fired) return;
      fired = true; deferred = e;
      $('pwa-sub').textContent = 'На весь екран, без адресного рядка';
      $('pwa-go').textContent = 'Встановити';
      $('pwa-go').onclick = function () {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; hide(); });
      };
      setTimeout(show, 1500);
    }

    // подія могла прилетіти ще до завантаження цього файлу — ловимо її в <head> (index.html)
    window.__pwaOnPrompt = usePrompt;
    if (window.__pwaPromptEvent) usePrompt(window.__pwaPromptEvent);
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); usePrompt(e); });

    // Браузер не прислав подію. Chrome/Edge так роблять, коли додаток уже встановлений
    // або ще не відповідає вимогам — тоді мовчимо (як у WashTime), не заважаємо.
    // Інструкцію показуємо лише браузерам, які цієї події не мають зовсім (Firefox, Samsung Internet).
    var chromium = /chrome|crios|edg\//i.test(ua) && !/samsungbrowser|firefox|fxios/i.test(ua);
    if (!chromium) {
      setTimeout(function () {
        if (fired) return;
        $('pwa-sub').textContent = 'Через меню браузера';
        $('pwa-go').textContent = 'Як?';
        $('pwa-go').onclick = function () { guide('android'); };
        show();
      }, 3000);
    } else log('Chrome не прислав beforeinstallprompt (додаток вже встановлений або не виконані вимоги PWA)');

    window.addEventListener('appinstalled', function () {
      hide();
      try { localStorage.removeItem(KEY); } catch (e) {}
    });

    function guide(platform) {
      var steps = platform === 'ios'
        ? ['Натисніть унизу в Safari <b>Поділитися</b> <span style="font-size:1.15em">&#x2934;</span>',
           'Оберіть <b>На екран «Додому»</b>',
           'Натисніть угорі праворуч <b>Додати</b>']
        : ['Відкрийте меню браузера <b>⋮</b> угорі праворуч',
           'Оберіть <b>Встановити застосунок</b> або <b>Додати на головний екран</b>',
           'Підтвердіть <b>Встановити</b>'];
      var ov = document.createElement('div');
      ov.className = 'pwa-ov';
      ov.innerHTML = '<div class="pwa-sheet"><h3>' + (platform === 'ios' ? 'Встановлення на iPhone' : 'Встановлення на Android') + '</h3>' +
        steps.map(function (t, i) { return '<div class="pwa-step"><div class="pwa-n">' + (i + 1) + '</div><div>' + t + '</div></div>'; }).join('') +
        '<button class="pwa-ok" type="button">Зрозуміло</button></div>';
      document.body.appendChild(ov);
      ov.querySelector('.pwa-ok').onclick = function () { ov.remove(); };
      ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
    }
  }

  window.PWAInstall = { init: init };
})();
