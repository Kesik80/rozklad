/* ============================================================
   app.js — вся спільна логіка «Розкладу» в одному файлі:
   тема · шапка · таблиці з schedule-data.js · підсвітка тексту ·
   «живе» розкладання · повідомлення про оновлення.

   Сторінка підключає тільки:
     <body data-page="назва_у_SCHEDULE.pages">
     <header class="hdr"></header><main id="app"></main>
     <script src="schedule-data.js"></script><script src="app.js"></script>
   ============================================================ */
(function () {
  'use strict';

  var D = window.SCHEDULE;
  var root = document.documentElement;
  var liveTimer = null;

  function $(s) { return document.querySelector(s); }
  function warn(msg) { try { console.warn('[розклад] ' + msg); } catch (e) {} }

  /* ============================================================
     ТЕМА
     Збережений вибір (кнопка) має пріоритет; якщо вибору нема —
     йдемо за системною темою і слідкуємо за нею наживо.
     Ранній виклик із <head> (див. сторінки) прибирає «спалах».
     ============================================================ */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getSaved() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function setSaved(v) { try { if (v === 'auto') localStorage.removeItem('theme'); else localStorage.setItem('theme', v); } catch (e) {} }
  function sys() { return mq && mq.matches ? 'dark' : 'light'; }
  // режим вибору: light | dark | auto (за системою)
  function mode() { var s = getSaved(); return s === 'light' || s === 'dark' ? s : 'auto'; }

  var ICON_ATTR = 'viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var THEME_ICONS = {
    light: '<svg ' + ICON_ATTR + '><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    dark: '<svg ' + ICON_ATTR + '><path d="M20 14.2A8 8 0 0 1 9.8 4 8 8 0 1 0 20 14.2Z"/></svg>',
    auto: '<svg ' + ICON_ATTR + '><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 1 0-17Z" fill="currentColor" stroke="none"/></svg>'
  };
  var THEME_NAMES = { light: 'Світла', dark: 'Темна', auto: 'Авто (як у системі)' };

  function paintThemeBtn() {
    var btn = $('#theme-toggle'); if (!btn) return;
    var m = mode();
    btn.innerHTML = THEME_ICONS[m];
    btn.setAttribute('aria-label', 'Тема: ' + THEME_NAMES[m] + '. Натисніть, щоб змінити');
  }

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    paintThemeBtn();
    var meta = $('#themeColorMeta');
    if (meta) {
      var bg = getComputedStyle(root).getPropertyValue('--bg-0').trim();
      if (bg) meta.setAttribute('content', bg);
    }
    if (liveTimer) updateLive();   // кольори градієнта залежать від теми
  }

  // тонка лінія під шапкою, коли сторінку прокрутили
  function initHeaderShadow() {
    var h = $('.hdr'); if (!h) return;
    function f() { h.classList.toggle('scrolled', (window.scrollY || document.documentElement.scrollTop) > 2); }
    window.addEventListener('scroll', f, { passive: true }); f();
  }

  function initTheme() {
    var m0 = mode();
    applyTheme(m0 === 'auto' ? sys() : m0);
    if (mq && mq.addEventListener) {
      mq.addEventListener('change', function () { if (mode() === 'auto') applyTheme(sys()); });
    }
    var btn = $('#theme-toggle');
    if (btn) btn.addEventListener('click', function () {
      // одна кнопка: світла → темна → авто → світла …
      var next = { light: 'dark', dark: 'auto', auto: 'light' }[mode()];
      setSaved(next);
      applyTheme(next === 'auto' ? sys() : next);
      exitToast('Тема: ' + THEME_NAMES[next]);
    });
  }

  /* ============================================================
     ПІДСВІТКА ТЕКСТУ — ОДНИМ ПРОХОДОМ
     • час + маркер (К П Б Ф Пн Верх) → цифри по центру, маркер збоку
     • окремі маркери → .marker
     • фрази з SCHEDULE.colors → свій css-клас
     Теги HTML не чіпаємо; результат уже підсвіченого не підсвічується вдруге.
     ============================================================ */
  var RE = null;
  function buildRe() {
    var ph = Object.keys(D.colors || {})
      .sort(function (a, b) { return b.length - a.length; })
      .map(function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    var MK = '(?:Верх|Пн|[КПБФ])(?:\\s+(?:Верх|Пн))*';   // маркер або кілька підряд: «Верх Пн»
    var src =
      '(' + (ph.length ? ph.join('|') : '\\b\\B') + ')' +                  // 1: фраза
      '|(\\d{1,2}:\\d{2})(?:\\s*(' + MK + ')(?![\\p{L}\\d]))?' +          // 2: час, 3: маркер після часу
      '|(^|[^\\p{L}\\d])(' + MK + ')(?![\\p{L}\\d])';                      // 4: що перед, 5: окремий маркер
    RE = new RegExp(src, 'gu');
  }

  function fmtPart(s) {
    return s.replace(RE, function (m, ph, tm, m1, pre, m2) {
      if (ph) return '<span class="' + D.colors[ph] + '">' + ph + '</span>';
      if (tm) return '<span class="tm">' + tm + (m1 ? '<span class="marker">' + m1 + '</span>' : '') + '</span>';
      return pre + '<span class="marker">' + m2 + '</span>';
    });
  }

  function fmt(s) {
    if (!s) return '';
    if (!RE) buildRe();
    return String(s).split(/(<[^>]*>)/).map(function (p, i) { return i % 2 ? p : fmtPart(p); }).join('');
  }

  /* ============================================================
     ДАНІ → ТАБЛИЦІ
     ============================================================ */
  function parse(x) { return (Array.isArray(x) ? x : String(x).split(',')).map(function (s) { return String(s).trim(); }); }
  function timesOf(key) { return typeof key === 'string' && D.times && D.times[key] != null ? D.times[key] : key; }
  function isTime(s) { return /\d{1,2}:\d{2}/.test(s || ''); }
  function timeOf(s) { var m = (s || '').match(/\d{1,2}:\d{2}/); return m ? m[0] : ''; }

  /* перевірка формату й порядку часу — помилки йдуть у консоль */
  function validate(name, tokens, unordered) {
    var prev = -1;
    tokens.forEach(function (tk, i) {
      var t = tk.replace(/^~/, '');
      if (!t || t === '-') return;
      var m = t.match(/^(\d{1,2}):(\d{2})\s*((?:Верх|Пн|[КПБФ])(?:\s+(?:Верх|Пн))*)?$/);
      if (!m || +m[1] > 23 || +m[2] > 59) { warn(name + ' #' + (i + 1) + ': "' + tk + '" — невірний формат часу'); return; }
      var min = +m[1] * 60 + +m[2];
      if (!unordered && min < prev) warn(name + ' #' + (i + 1) + ': ' + t + ' раніше за попередній рядок');
      prev = min;
    });
  }

  var MON_RE = /(^|[\s\d])Пн(?![\p{L}\d])/u;      // маркер «Пн» → рейс лише в понеділок
  var VERH_RE = /(^|[\s\d])Верх(?![\p{L}\d])/u;   // маркер «Верх» → рейс через Верхоли

  function cellAttrs(tok, day, group, split) {
    var t = timeOf(tok);
    if (!t) return '';
    var mf = tok.charAt(0) === '~';
    var d = mf ? 'mf' : MON_RE.test(tok) ? 'mon' : day;
    return ' data-time="' + t + '" data-day="' + d + '" data-group="' + (split && mf ? group + '~' : group) + '"';
  }

  function cellHtml(tok, day, group, extraCls, split) {
    var mf = tok.charAt(0) === '~';
    var cls = (extraCls || '') + (mf ? ' mf' : '');
    return '<td' + (cls.trim() ? ' class="' + cls.trim() + '"' : '') + cellAttrs(tok, day, group, split) + '>' +
      fmt(mf ? tok.slice(1) : tok) + '</td>';
  }

  function locHtml(name) {
    var m = name.match(/^([^(]+?)\s*(\(.*\))$/);
    return m ? '<td class="loc">' + m[1] + ' <span class="loc-hint">' + m[2] + '</span></td>'
             : '<td class="loc">' + name + '</td>';
  }

  /* Заголовок колонки з «важкими» маркерами (Пн, Верх Пн — майже в кожному рядку):
     цифри лишаються рівно одна під одною, а заголовок центрується над цифрами І маркером разом,
     інакше він здається зсунутим уліво. Повертає лівий відступ <th> (0 = нічого не міняти). */
  var _cv = null;
  function textW(txt, w) {
    try {
      _cv = _cv || document.createElement('canvas').getContext('2d');
      _cv.font = w + ' 17px ' + (getComputedStyle(document.body).fontFamily || 'sans-serif');
      return _cv.measureText(txt).width;
    } catch (e) { return txt.length * 9; }
  }
  function headShift(toks, th, cellW) {
    var n = 0, withMk = 0, mw = 0;
    toks.forEach(function (t) {
      var m = /^~?\s*\d{1,2}:\d{2}\s*(.*)$/.exec(String(t).trim());
      if (!m) return;
      n++;
      if (m[1]) { withMk++; mw = Math.max(mw, textW(m[1], 700) + m[1].length * 0.3); }
    });
    if (!n || withMk < n * 0.75) return 0;
    var want = Math.round(mw + 5);                               // 2 + 2·((маркер + 3px зазору) / 2)
    var spare = Math.floor(cellW - 10 - textW(th.replace(/<[^>]*>/g, ''), 700) - 4);
    return Math.max(2, Math.min(want, spare));
  }

  function renderGrid(P, pageName, id, hideVerRows) {
    var cols = P.cols.map(function (c) {
      var toks = c.loc ? parse(P.loc) : parse(timesOf(c.t));
      if (!c.loc) validate(pageName + ' / ' + c.th + ' (' + (typeof c.t === 'string' && c.t.length < 20 ? c.t : 'колонка') + ')', toks, P.unordered);
      return { spec: c, toks: toks };
    });
    var n = cols.length;
    var widths = P.widths || cols.map(function () { return 100 / n; });
    var rows = Math.max.apply(null, cols.map(function (c) { return c.toks.length; }));

    var h = '<table' + (id ? ' id="' + id + '"' : '') + (P.align === 'left' ? ' class="left"' : '') + '><colgroup>' +
      widths.map(function (w) { return '<col style="width:' + w + '%">'; }).join('') + '</colgroup><tr>';
    var tw = Math.min(document.documentElement.clientWidth || 360, 640) - 16;
    cols.forEach(function (c, ci) {
      var pl = c.spec.loc ? 0 : headShift(c.toks, c.spec.th, tw * widths[ci] / 100);
      h += '<th' + (c.spec.red ? ' class="red"' : '') + (pl ? ' style="padding-left:' + pl + 'px"' : '') + '>' + c.spec.th + '</th>';
    });
    h += '</tr>';
    for (var i = 0; i < rows; i++) {
      var ver = hideVerRows && cols.some(function (c) { return VERH_RE.test(c.toks[i] || ''); });
      h += '<tr' + (ver ? ' class="ver-row"' : '') + '>';
      cols.forEach(function (c) {
        var tok = c.toks[i] || '';
        h += c.spec.loc ? locHtml(tok) : cellHtml(tok, c.spec.day || 'all', c.spec.group || ('c' + cols.indexOf(c)), '', P.splitMf);
      });
      h += '</tr>';
    }
    return h + '</table>';
  }

  /* Вовківка: кнопка «Верхоли» ховає рейси «Верх» з головної таблиці й показує окрему */
  function renderToggle(P, pageName) {
    var T = P.toggle;
    return '<div class="toggle-wrap"><button id="ver-toggle" class="toggle-ver" type="button">▼ ' + T.label + '</button></div>' +
      '<div id="ver-section" class="ver-section">' +
      renderGrid(T.grid, pageName + ' / ' + T.label, 'ver-grid') + '</div>';
  }

  function initToggle(P) {
    var T = P.toggle, btn = $('#ver-toggle'), sec = $('#ver-section');
    if (!btn || !sec) return;
    var on = false;
    try { on = localStorage.getItem(T.key) === '1'; } catch (e) {}
    function apply() {
      sec.classList.toggle('show', on);
      btn.classList.toggle('active', on);
      btn.textContent = (on ? '▲ ' : '▼ ') + T.label;
      document.querySelectorAll('#grid .ver-row').forEach(function (tr) { tr.style.display = on ? 'none' : ''; });
      updateLive();
    }
    btn.addEventListener('click', function () {
      on = !on;
      try { localStorage.setItem(T.key, on ? '1' : '0'); } catch (e) {}
      apply();
    });
    apply();
  }

  function renderRoutes(P, pageName) {
    return P.routes.map(function (r) {
      var rows = r.rows.map(function (row) { return { loc: row[0], toks: parse(row[1]), key: !!row[2] }; });
      var n = Math.max.apply(null, rows.map(function (x) { return x.toks.length; }));
      for (var c = 0; c < n; c++) {
        validate(pageName + ' / ' + r.from + '→' + r.to + ' / рейс ' + (c + 1), rows.map(function (x) { return x.toks[c] || ''; }));
      }
      var h = '<table class="plain"><colgroup><col style="width:11ch">';
      for (var k = 0; k < n; k++) h += '<col style="width:calc((100% - 11ch) / ' + n + ')">';
      h += '</colgroup><tr><th class="tbl-title" colspan="' + (n + 1) + '"><span class="from">' + r.from + '</span> — ' + r.to + '</th></tr>';
      rows.forEach(function (x) {
        h += '<tr><td class="loc' + (x.key ? ' key' : '') + '">' + x.loc + '</td>';
        for (var j = 0; j < n; j++) h += cellHtml(x.toks[j] || '', 'all', r.group);
        h += '</tr>';
      });
      return h + '</table>';
    }).join('');
  }

  function renderMenu() {
    return '<div class="menu">' + D.menu.map(function (m) {
      return m.soon || !m.href
        ? '<div class="row soon"><span class="label">' + m.label + '</span></div>'
        : '<a class="row" href="' + m.href + '"><span class="label">' + m.label + '</span></a>';
    }).join('') + '</div>';
  }

  /* усі підписи меню — однієї ширини (по найширшому), щоб стояли рівним стовпчиком */
  function equalize(sel) {
    var els = document.querySelectorAll(sel), max = 0;
    els.forEach(function (e) { e.style.width = 'auto'; });
    els.forEach(function (e) { max = Math.max(max, e.getBoundingClientRect().width); });
    els.forEach(function (e) { e.style.width = max + 'px'; });
  }

  function renderNotes(P) {
    function res(s) { return s.charAt(0) === '@' ? (D.notes[s.slice(1)] || '') : s; }
    var h = (P.notes || []).map(function (n) {
      if (n && n.raw) return '<div class="note">' + n.raw + '</div>';   // без автопідсвітки
      var html = Array.isArray(n) ? n.map(res).join('<br>') : res(n);
      return '<div class="note">' + fmt(html) + '</div>';
    }).join('');
    if (D.updated && P.type !== 'menu') {
      var m = String(D.updated).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      h += '<div class="updated">Оновлено: ' + (m ? m[3] + '.' + m[2] + '.' + m[1] : D.updated) + '</div>';
    }
    return h;
  }

  function renderHeader(P) {
    var h = $('.hdr');
    if (!h) return;
    h.innerHTML =
      (P.back === false ? '<span class="hdr-side"></span>'
                        : '<a class="btn-icon" href="index.html" aria-label="Назад">‹</a>') +
      '<div class="hdr-mid"><div class="hdr-title">' + P.title + '</div>' +
      (P.sub ? '<div class="hdr-sub">' + P.sub + '</div>' : '') + '</div>' +
      (P.right === 'none' ? '<span class="hdr-side"></span>' : P.right === 'share'
        ? '<button id="share-btn" class="btn-icon" type="button" aria-label="Поділитися"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8 15.7 6.2M8.3 13.2l7.4 4.6"/></svg></button>'
        : P.type === 'menu'
          ? '<button id="theme-toggle" class="btn-icon" type="button" aria-label="Змінити тему"></button>'
          : '<button id="save-img" class="btn-icon" type="button" aria-label="Зберегти картинкою"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v10"/><path d="M7.5 10 12 14.5 16.5 10"/><path d="M5 19h14"/></svg></button>');
  }

  /* ============================================================
     «ЖИВЕ» РОЗКЛАДАННЯ
     • найближчий рейс кожної групи — синя заливка клітинки;
     • за 5 хв до відправлення — бурштинова, за 2 хв — червона, що пульсує;
     • день тижня береться з SCHEDULE.days (субота = будні тощо).
     ============================================================ */
  var SOON_SEC = 5 * 60, NOW_SEC = 2 * 60;

  function dayActive(day, dow) {
    var list = D.days && D.days[day];
    return !list || list.indexOf(dow) >= 0;
  }

  function updateLive() {
    var now = new Date();
    var dow = now.getDay();
    var nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    var cells = document.querySelectorAll('[data-time]');
    var next = {};   // група → { diff, el }
    var info = [];

    cells.forEach(function (td) {
      if (!dayActive(td.dataset.day, dow) || td.offsetParent === null) { info.push(null); return; }  // не той день або рядок схований
      var p = td.dataset.time.split(':');
      var diff = +p[0] * 3600 + +p[1] * 60 - nowSec;
      info.push(diff);
      var g = td.dataset.group || '_';
      if (diff > 0 && (!next[g] || diff < next[g].diff)) next[g] = { diff: diff, el: td };
    });

    cells.forEach(function (td, i) {
      var diff = info[i], isNext = false;
      if (diff !== null) isNext = next[td.dataset.group || '_'] && next[td.dataset.group || '_'].el === td;
      td.classList.toggle('next-dep', !!isNext);                                          // найближчий рейс: синя заливка
      td.classList.toggle('dep-soon', !!isNext && diff <= SOON_SEC);                      // ≤ 5 хв: бурштинова
      td.classList.toggle('dep-now',  !!isNext && diff <= NOW_SEC);                       // ≤ 2 хв: червона, пульсує
      if (isNext) fitPlate(td);
    });
  }

  /* плашка найближчого рейсу не має вилазити за ячейку: відступи від тексту — до 11px,
     але не більше, ніж є вільного місця зліва/справа (у вузьких колонках — менше) */
  function fitPlate(td) {
    var tm = td.querySelector('.tm');
    if (!tm || !td.offsetWidth) return;
    var mk = td.querySelector('.marker'), mw = mk ? mk.offsetWidth + 3 : 0;
    var a = td.getBoundingClientRect(), b = tm.getBoundingClientRect();
    var pl = Math.max(1, Math.min(11, Math.floor(b.left - a.left) - 1));
    var pr = Math.max(1, Math.min(11, Math.floor(a.right - b.right - mw) - 1));
    td.style.setProperty('--mw', mw + 'px');
    td.style.setProperty('--pl', pl + 'px');
    td.style.setProperty('--pr', pr + 'px');
  }

  function startLive() {
    if (!document.querySelector('[data-time]')) return;
    updateLive();
    liveTimer = setInterval(updateLive, 10000);
    // телефон «присипляє» таймер у фоні — оновлюємо одразу, як тільки повернулись
    document.addEventListener('visibilitychange', function () { if (!document.hidden) updateLive(); });
    window.addEventListener('pageshow', updateLive);
    window.addEventListener('focus', updateLive);
  }

  /* ============================================================
     «РОЗКЛАД ОНОВЛЕНО» — сигнал від sw.js, коли файли змінились
     ============================================================ */
  function initUpdateToast() {
    if (!('serviceWorker' in navigator)) return;
    var shown = false;
    navigator.serviceWorker.addEventListener('message', function (e) {
      if (shown || !e.data || e.data.type !== 'updated') return;
      shown = true;
      var b = document.createElement('button');
      b.className = 'toast';
      b.textContent = 'Розклад оновлено — торкніться, щоб побачити';
      b.onclick = function () { location.reload(); };
      document.body.appendChild(b);
    });
  }


  /* ============================================================
     НАВІГАЦІЯ «НАЗАД»
     • кнопка ‹ і системна «Назад» на підсторінці → завжди головна;
     • на головній: перше «Назад» — підказка, друге (протягом 2.5 с) — вихід.
     Захисний запис в історію додається після першого дотику
     (інакше Chrome його пропускає).
     ============================================================ */
  function exitToast(msg) {
    var t = document.querySelector('.exit-toast');
    if (!t) { t = document.createElement('div'); t.className = 'exit-toast'; document.body.appendChild(t); }
    t.textContent = msg || 'Натисніть «Назад» ще раз, щоб вийти';
    t.classList.add('show');
    clearTimeout(exitToast._t);
    exitToast._t = setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  /* ============================================================
     ЗБЕРЕЖЕННЯ СТОРІНКИ КАРТИНКОЮ (PNG)
     Завжди у СВІТЛІЙ темі, разом із примітками. Без сторонніх бібліотек:
     копія сторінки → SVG (foreignObject) → canvas → PNG.
     ============================================================ */
  var SNAP_W = 412, SNAP_SCALE = 3;

  function snapCss(css) {   // :root / html / body → .snap, щоб змінні теми та фон працювали всередині картинки
    return css.replace(/:root\b/g, '.snap')
              .replace(/(^|[\s,}])html\b/g, '$1.snap')
              .replace(/(^|[\s,}])body\b/g, '$1.snap');
  }

  function snapMarkup(withVer) {
    var app = $('#app').cloneNode(true), hdr = $('.hdr').cloneNode(true);
    [].forEach.call(app.querySelectorAll('button, .toggle-wrap'), function (n) { n.remove(); });
    [].forEach.call(app.querySelectorAll('.next-dep'), function (n) { n.classList.remove('next-dep', 'dep-soon', 'dep-now'); });
    [].forEach.call(app.querySelectorAll('td'), function (n) { n.style.removeProperty('color'); n.style.removeProperty('font-weight'); });
    var sec = app.querySelector('.ver-section');
    if (sec) {   // два вигляди сторінки: з блоком «Верхоли» (рейси «Верх» переходять у нього) і без нього
      if (withVer) { sec.classList.add('show'); [].forEach.call(app.querySelectorAll('.ver-row'), function (n) { n.style.display = 'none'; }); }
      else { sec.remove(); [].forEach.call(app.querySelectorAll('.ver-row'), function (n) { n.style.display = ''; }); }
    }
    [].forEach.call(hdr.querySelectorAll('a.btn-icon, button.btn-icon'), function (n) { n.outerHTML = '<span class="hdr-side"></span>'; });
    var d = new Date(), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    return '<div class="snap" data-theme="light" xmlns="http://www.w3.org/1999/xhtml" style="width:' + SNAP_W + 'px;max-width:none;margin:0;">' +
      '<div class="hdr">' + hdr.innerHTML + '</div>' + app.outerHTML +
      '<div style="text-align:center;font:500 12px sans-serif;color:#66666b;padding:10px 0 2px;">Розклад Терешки · tereschky.vercel.app · ' +
      p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + d.getFullYear() + '</div></div>';
  }

  function saveImage(withVer, suffix, done) {
    var name = document.body.getAttribute('data-page') + (suffix || '');
    function fin(msg) { exitToast(msg); if (done) done(); }
    fetch('app.css').then(function (r) { return r.text(); }).then(function (css0) {
      var css = snapCss(css0), html = snapMarkup(withVer);
      var fr = document.createElement('iframe');
      fr.style.cssText = 'position:fixed;left:-10000px;top:0;width:' + SNAP_W + 'px;height:100px;border:0;visibility:hidden';
      fr.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body style="margin:0">' + html + '</body></html>';
      fr.onload = function () {
        setTimeout(function () {
          try {
            var el = fr.contentDocument.querySelector('.snap'), h = Math.ceil(el.getBoundingClientRect().height);
            var xml = new XMLSerializer().serializeToString(el);
            fr.remove();
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + SNAP_W + '" height="' + h + '"><foreignObject width="100%" height="100%">' +
              '<style xmlns="http://www.w3.org/1999/xhtml"><![CDATA[' + css + ']]></style>' + xml + '</foreignObject></svg>';
            var img = new Image();
            img.onload = function () {
              var c = document.createElement('canvas');
              c.width = SNAP_W * SNAP_SCALE; c.height = h * SNAP_SCALE;
              var ctx = c.getContext('2d');
              ctx.scale(SNAP_SCALE, SNAP_SCALE); ctx.drawImage(img, 0, 0);
              c.toBlob(function (b) {
                if (!b) { fin('Не вдалося створити картинку'); return; }
                var d = new Date(), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
                var a = document.createElement('a');
                a.href = URL.createObjectURL(b);
                a.download = 'rozklad_' + name + '_' + p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2) + '.png';
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
                fin('Картинку збережено');
              }, 'image/png');
            };
            img.onerror = function () { fin('Не вдалося створити картинку'); };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
          } catch (e) { warn('картинка: ' + e.message); fin('Не вдалося створити картинку'); }
        }, 150);
      };
      document.body.appendChild(fr);
    }).catch(function () { fin('Не вдалося створити картинку'); });
  }

  function initNav(isHome) {
    var S = history.state || {}, armed = false;
    function onGesture(fn) {
      ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { addEventListener(ev, fn, { once: true, passive: true }); });
    }
    try {
      if (isHome) {
        if (S.rz === 'guard') armed = true;
        else if (S.rz !== 'home') history.replaceState({ rz: 'home' }, '');
        var arm = function () {
          if (armed || !history.state || history.state.rz !== 'home') return;
          armed = true; history.pushState({ rz: 'guard' }, '');
        };
        onGesture(arm);
        addEventListener('popstate', function () {
          if (!history.state || history.state.rz !== 'home') return;
          armed = false;               // ми на першому записі: наступне «Назад» вийде з додатка
          exitToast();
          setTimeout(function () { onGesture(arm); }, 2600);
        });
      } else {
        var fi = false;
        if (S.rz) fi = !!S.fi;
        else {
          try { var u = new URL(document.referrer); fi = u.origin === location.origin && /(^\/$|index\.html$)/.test(u.pathname); } catch (e) {}
          history.replaceState({ rz: 'sub', fi: fi }, '');
        }
        if (S.rz === 'subguard') armed = true;
        onGesture(function () {
          if (armed || !history.state || history.state.rz !== 'sub') return;
          armed = true; history.pushState({ rz: 'subguard', fi: fi }, '');
        });
        addEventListener('popstate', function () {
          if (history.state && history.state.rz === 'sub') { fi ? history.go(-1) : location.replace('index.html'); }
        });
        var b = document.querySelector('.hdr a.btn-icon[href]');
        if (b) b.addEventListener('click', function (e) {
          e.preventDefault();
          var guard = history.state && history.state.rz === 'subguard';
          if (fi) history.go(guard ? -2 : -1); else location.replace('index.html');
        });
      }
    } catch (e) { warn('навігація: ' + e.message); }
  }

  /* ============================================================
     СТАРТ
     ============================================================ */
  function init() {
    var name = document.body.getAttribute('data-page');
    var P = D && D.pages && D.pages[name];
    var app = $('#app');
    if (!P || !app) { warn('невідома сторінка: ' + name); return; }

    renderHeader(P);
    initNav(P.back === false);
    try {
      if (P.type !== 'static') {   // 'static' — сторінка зі своєю розміткою (info.html)
        app.innerHTML =
          (P.type === 'menu' ? renderMenu() : P.type === 'routes' ? renderRoutes(P, name) : renderGrid(P, name, 'grid', !!P.toggle)) +
          (P.toggle ? renderToggle(P, name) : '') +
          renderNotes(P);
      }
    } catch (e) {
      app.innerHTML = '<div class="note">Помилка даних розкладу. Перевірте schedule-data.js</div>';
      warn('помилка рендеру: ' + e.message);
    }

    if (P.type === 'menu') equalize('.menu .label');
    initTheme();
    initHeaderShadow();
    var si = $('#save-img');
    if (si) si.addEventListener('click', function () {
      exitToast('Створюю картинку…');
      var sec = $('#ver-section');   // сторінка з перемикачем: зберігаємо той вигляд, що зараз на екрані
      saveImage(!!(P.toggle && sec && sec.classList.contains('show')), '');
    });
    /* м'яка підказка: раз на 30 с кнопка «Зберегти» легенько «дихає» (щоб не робили скриншоти) */
    if (si) setInterval(function () {
      if (document.hidden) return;
      si.classList.add('nudge');
      setTimeout(function () { si.classList.remove('nudge'); }, 1800);
    }, 30000);
    startLive();
    if (P.toggle) initToggle(P);
    initUpdateToast();
    if (window.PWAInstall) PWAInstall.init({ appName: 'Розклад' });
  }

  window.Rozklad = { applyTheme: applyTheme, updateLive: updateLive };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
