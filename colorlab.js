/* COLORLAB — мобільний «піпетка + підбір кольору» (як console.js, але для кольорів).
   Вмикання: Info → «Підбір кольору» (або ?colorlab=1 в адресі, ?colorlab=0 — вимкнути).
   Як користуватись:
     1) Натисни 🎨 → увімкнено режим вибору; торкнись будь-якого слова або фону (посилання не спрацьовують).
     2) У панелі внизу: вкладки «Текст» / «Фон», поточний колір, HEX, контраст з тлом (WCAG).
     3) Рухай бігунки Тон / Насиченість / Яскравість — колір змінюється одразу. Смужка під «Яскравістю»
        показує, де контраст достатній (зелене ≥ 4.5, жовте ≥ 3, червоне — погано).
     4) «Усі такі самі» — змінити всі елементи з таким самим кольором на сторінці (інакше — лише вибраний).
     5) «Копіювати» — зведення змін (колір було → стало, тема, змінна CSS), щоб надіслати мені.
   Нічого не зберігається: після перезавантаження сторінка знову така, як у файлах. */
(function () {
  'use strict';
  var KEY = 'colorlab';
  try {
    var q = /[?&]colorlab=([01])/.exec(location.search);
    if (q) localStorage.setItem(KEY, q[1]);
  } catch (e) {}
  var enabled = false;
  try { enabled = localStorage.getItem(KEY) === '1'; } catch (e) {}
  window.ColorLab = {
    enabled: function () { return enabled; },
    set: function (v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} }
  };
  if (!enabled) return;

  var VARS = ['--bg-0', '--bg-1', '--bg-2', '--label', '--label-2', '--label-3', '--separator', '--accent', '--next', '--th', '--hint', '--red', '--wd', '--ok', '--th-bg', '--key'];
  var HUES = [['червоний', 355, 70], ['помаранч.', 25, 90], ['коричн.', 28, 45], ['жовтий', 48, 90], ['зелений', 140, 55], ['бірюз.', 175, 65], ['блакитн.', 200, 90], ['синій', 215, 85], ['фіолет.', 265, 60], ['сірий', 220, 8]];

  /* ---------- кольорові утиліти ---------- */
  function parse(c) {                       // → [r,g,b,a] 0..255, a 0..1
    if (!c) return [0, 0, 0, 0];
    var m = /rgba?\(([^)]+)\)/.exec(c);
    if (m) { var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    m = /color\(srgb\s+([^)]+)\)/.exec(c);
    if (m) { var q = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat); return [q[0] * 255, q[1] * 255, q[2] * 255, q.length > 3 ? q[3] : 1]; }
    if (c === 'transparent') return [0, 0, 0, 0];
    return [0, 0, 0, 0];
  }
  function hex(r, g, b) { return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function fromHex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s * 100, l * 100];
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  }
  function lum(r, g, b) { var f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); }
  function ratio(a, b) { var l1 = lum(a[0], a[1], a[2]), l2 = lum(b[0], b[1], b[2]), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + .05) / (lo + .05); }
  function blend(top, bot) { var a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; }

  function bgOf(el) {                       // фактичний фон під елементом (із накладанням напівпрозорих шарів)
    var stack = [], n = el;
    while (n && n.nodeType === 1) { var c = parse(getComputedStyle(n).backgroundColor); if (c[3] > 0) stack.push(c); if (c[3] >= .999) break; n = n.parentElement; }
    var res = [255, 255, 255, 1];
    for (var i = stack.length - 1; i >= 0; i--) res = blend(stack[i], res);
    return res;
  }
  function varName(c) {                     // чи збігається колір зі змінною теми
    var probe = document.createElement('i'); probe.style.cssText = 'position:absolute;visibility:hidden';
    document.body.appendChild(probe);
    var found = [];
    VARS.forEach(function (v) {
      probe.style.color = 'var(' + v + ')';
      var pc = parse(getComputedStyle(probe).color);
      if (Math.abs(pc[0] - c[0]) < 1.5 && Math.abs(pc[1] - c[1]) < 1.5 && Math.abs(pc[2] - c[2]) < 1.5) found.push(v);
    });
    probe.remove();
    return found;
  }
  function describe(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    return s;
  }

  /* ---------- інтерфейс ---------- */
  var ui = {}, active = false, sel = null, tab = 'text', all = false, hsl = [0, 0, 50], orig = null, outlined = null, changes = [], applied = [];
  var css = document.createElement('style');
  css.textContent =
    '#cl-fab{position:fixed;right:12px;bottom:12px;z-index:2147483001;width:46px;height:46px;border-radius:50%;border:2px solid #fff;background:#222;color:#fff;font-size:22px;line-height:1;box-shadow:0 2px 10px rgba(0,0,0,.5);padding:0}' +
    '#cl-fab.on{background:#d6249f}' +
    '#cl-panel{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#15171c;color:#eef0f4;font:13px/1.35 -apple-system,Roboto,sans-serif;padding:10px 12px 14px;border-top:2px solid #d6249f;max-height:58vh;overflow:auto;display:none}' +
    '#cl-panel *{box-sizing:border-box;font-family:inherit}' +
    '#cl-panel .r{display:flex;align-items:center;gap:8px;margin:6px 0}' +
    '#cl-panel .sw{width:46px;height:46px;border-radius:10px;border:1px solid #555;flex:none}' +
    '#cl-panel .t{flex:1;min-width:0}' +
    '#cl-panel .t b{font-size:15px}' +
    '#cl-panel .sm{opacity:.7;font-size:12px;word-break:break-all}' +
    '#cl-panel button{background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:7px 10px;font-size:13px}' +
    '#cl-panel button.on{background:#d6249f;border-color:#d6249f}' +
    '#cl-panel input[type=text]{background:#0e1014;color:#fff;border:1px solid #3a4150;border-radius:8px;padding:6px 8px;width:92px;font-size:14px}' +
    '#cl-panel input[type=range]{flex:1;min-width:0;height:26px;-webkit-appearance:none;appearance:none;border-radius:13px;border:1px solid #444}' +
    '#cl-panel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:2px solid #d6249f}' +
    '#cl-panel label.lb{width:78px;flex:none;font-size:12px;opacity:.85}' +
    '#cl-panel .zone{height:7px;border-radius:4px;margin:-2px 0 4px 86px;display:flex;overflow:hidden}' +
    '#cl-panel .zone i{flex:1}' +
    '#cl-panel .chips{display:flex;flex-wrap:wrap;gap:5px}' +
    '#cl-panel .chips button{padding:5px 8px;font-size:12px}' +
    '#cl-panel .bad{color:#ff7b72}#cl-panel .ok{color:#56d364}#cl-panel .mid{color:#e3b341}';
  document.head.appendChild(css);

  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }

  ui.fab = el('button', { id: 'cl-fab', type: 'button', 'aria-label': 'Підбір кольору' }, '🎨');
  ui.panel = el('div', { id: 'cl-panel' });
  ui.panel.innerHTML =
    '<div class="r"><div class="sw" id="cl-sw"></div><div class="t"><b id="cl-name">Торкнись слова або фону</b><div class="sm" id="cl-info"></div></div></div>' +
    '<div class="r"><button id="cl-tt" class="on" type="button">Текст</button><button id="cl-tb" type="button">Фон</button>' +
    '<input id="cl-hex" type="text" maxlength="7" value="#" aria-label="HEX"><span id="cl-ratio" class="sm"></span></div>' +
    '<div class="r"><label class="lb">Тон</label><input id="cl-h" type="range" min="0" max="360" step="1"></div>' +
    '<div class="r"><label class="lb">Насиченість</label><input id="cl-s" type="range" min="0" max="100" step="1"></div>' +
    '<div class="r"><label class="lb">Яскравість</label><input id="cl-l" type="range" min="0" max="100" step="1"></div>' +
    '<div class="zone" id="cl-zone"></div>' +
    '<div class="chips" id="cl-chips"></div>' +
    '<div class="r"><button id="cl-all" type="button">Усі такі самі: ні</button><button id="cl-reset" type="button">Скасувати</button><button id="cl-copy" type="button">Копіювати</button><button id="cl-close" type="button">✕</button></div>' +
    '<div class="sm" id="cl-log"></div>';
  document.body.appendChild(ui.fab);
  document.body.appendChild(ui.panel);
  function $(id) { return document.getElementById(id); }
  ['sw', 'name', 'info', 'tt', 'tb', 'hex', 'ratio', 'h', 's', 'l', 'zone', 'chips', 'all', 'reset', 'copy', 'close', 'log'].forEach(function (k) { ui[k] = $('cl-' + k); });
  HUES.forEach(function (h) { var b = el('button', { type: 'button' }, h[0]); b.addEventListener('click', function () { if (!sel) return; hsl[0] = h[1]; hsl[1] = h[2]; if (h[0] === 'сірий') hsl[1] = h[2]; refreshSliders(); applyHsl(); }); ui.chips.appendChild(b); });

  /* ---------- вибір елемента ---------- */
  function inUi(t) { return t === ui.fab || ui.panel.contains(t); }
  function clearOutline() { if (outlined) { outlined.el.style.outline = outlined.o; outlined.el.style.outlineOffset = outlined.f; outlined = null; } }
  function select(t) {
    clearOutline();
    sel = t;
    outlined = { el: t, o: t.style.outline, f: t.style.outlineOffset };
    t.style.outline = '2px dashed #d6249f'; t.style.outlineOffset = '1px';
    load();
  }
  function curProp() { return tab === 'text' ? 'color' : 'backgroundColor'; }
  function curColor() {
    if (!sel) return [0, 0, 0, 1];
    if (tab === 'text') return parse(getComputedStyle(sel).color);
    var c = bgOf(sel); return c;
  }
  function load() {
    var c = curColor();
    orig = { rgb: c.slice(0, 3), prop: curProp(), el: sel };
    var h = rgb2hsl(c[0], c[1], c[2]); hsl = [h[0], h[1], h[2]];
    refreshSliders(); update(false);
  }
  function refreshSliders() { ui.h.value = Math.round(hsl[0]); ui.s.value = Math.round(hsl[1]); ui.l.value = Math.round(hsl[2]); paintTracks(); }
  function otherColor() {                    // з чим міряємо контраст
    if (!sel) return [255, 255, 255];
    return tab === 'text' ? bgOf(sel) : parse(getComputedStyle(sel).color);
  }
  function paintTracks() {
    var s = hsl[1], l = hsl[2], h = hsl[0], i, st = [];
    for (i = 0; i <= 12; i++) { var r = hsl2rgb(i * 30, s, l); st.push(hex(r[0], r[1], r[2])); }
    ui.h.style.background = 'linear-gradient(90deg,' + st.join(',') + ')';
    var a = hsl2rgb(h, 0, l), b = hsl2rgb(h, 100, l);
    ui.s.style.background = 'linear-gradient(90deg,' + hex(a[0], a[1], a[2]) + ',' + hex(b[0], b[1], b[2]) + ')';
    st = []; for (i = 0; i <= 10; i++) { var rr = hsl2rgb(h, s, i * 10); st.push(hex(rr[0], rr[1], rr[2])); }
    ui.l.style.background = 'linear-gradient(90deg,' + st.join(',') + ')';
    var oc = otherColor(), z = '';                          // зона достатнього контрасту
    for (i = 0; i < 40; i++) { var q = hsl2rgb(h, s, i * 100 / 39), cr = ratio(q, oc); z += '<i style="background:' + (cr >= 4.5 ? '#2ea043' : cr >= 3 ? '#d29922' : '#8b2b2b') + '"></i>'; }
    ui.zone.innerHTML = z;
  }
  function update(write) {
    var rgb = hsl2rgb(hsl[0], hsl[1], hsl[2]), hx = hex(rgb[0], rgb[1], rgb[2]);
    ui.sw.style.background = hx; ui.hex.value = hx;
    var oc = otherColor(), cr = ratio(rgb, oc), cls = cr >= 4.5 ? 'ok' : cr >= 3 ? 'mid' : 'bad';
    ui.ratio.innerHTML = 'контраст з ' + (tab === 'text' ? 'тлом' : 'текстом') + ' <b class="' + cls + '">' + cr.toFixed(1) + ':1</b> ' + (cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'лише великий текст' : 'погано');
    if (sel) {
      var vs = varName(orig ? orig.rgb.concat([1]) : [0, 0, 0, 1]);
      ui.name.textContent = describe(sel) + ' — ' + (sel.children.length ? '' : '«' + (sel.textContent || '').trim().slice(0, 24) + '»');
      ui.info.textContent = 'було ' + hex(orig.rgb[0], orig.rgb[1], orig.rgb[2]) + (vs.length ? ' = ' + vs.join(' / ') : '') + ' · тема: ' + (document.documentElement.getAttribute('data-theme') || 'авто');
    }
    paintTracks();
    if (write) paint(hx);
  }
  function targets() {
    if (!sel) return [];
    if (!all) return [sel];
    var key = orig.rgb.map(Math.round).join(','), prop = orig.prop === 'color' ? 'color' : 'backgroundColor', out = [];
    var list = document.body.querySelectorAll('*');
    for (var i = 0; i < list.length; i++) {
      var n = list[i]; if (inUi(n)) continue;
      var c = prop === 'color' ? parse(getComputedStyle(n).color) : parse(getComputedStyle(n).backgroundColor);
      if (c[3] > 0 && c.slice(0, 3).map(Math.round).join(',') === key) out.push(n);
    }
    if (out.indexOf(sel) < 0) out.push(sel);
    return out;
  }
  function paint(hx) {
    var prop = orig.prop === 'color' ? 'color' : 'background-color';
    targets().forEach(function (n) {
      if (!n.__cl) n.__cl = { prop: prop, old: n.style.getPropertyValue(prop), pr: n.style.getPropertyPriority(prop) };
      if (applied.indexOf(n) < 0) applied.push(n);
      n.style.setProperty(prop, hx, 'important');
      n.style.setProperty('transition', 'none');
    });
    var key = describe(sel) + '|' + prop;
    var ch = null; for (var i = 0; i < changes.length; i++) if (changes[i].key === key) ch = changes[i];
    if (!ch) { ch = { key: key, el: describe(sel), text: (sel.textContent || '').trim().slice(0, 24), prop: prop === 'color' ? 'текст' : 'фон', from: hex(orig.rgb[0], orig.rgb[1], orig.rgb[2]), vars: varName(orig.rgb.concat([1])), n: 1 }; changes.push(ch); }
    ch.to = hx; ch.n = targets().length; ch.all = all;
    ui.log.textContent = 'Змін: ' + changes.length;
  }
  function applyHsl() { update(true); }

  function resetAll() {
    applied.forEach(function (n) { if (n.__cl) { if (n.__cl.old) n.style.setProperty(n.__cl.prop, n.__cl.old, n.__cl.pr); else n.style.removeProperty(n.__cl.prop); n.style.removeProperty('transition'); delete n.__cl; } });
    applied = []; changes = []; ui.log.textContent = 'Скасовано'; if (sel) load();
  }
  function summary() {
    var th = document.documentElement.getAttribute('data-theme') || 'авто', pg = (document.body.getAttribute('data-page') || location.pathname);
    var lines = ['Сторінка: ' + pg + ' · тема: ' + th];
    changes.forEach(function (c) { lines.push('• ' + c.el + (c.text ? ' «' + c.text + '»' : '') + ' [' + c.prop + ']: ' + c.from + (c.vars.length ? ' (' + c.vars.join('/') + ')' : '') + ' → ' + c.to + (c.all ? ' · усі такі самі (' + c.n + ' ел.)' : '')); });
    return lines.join('\n');
  }

  /* ---------- події ---------- */
  function setActive(v) {
    active = v; ui.fab.classList.toggle('on', v); ui.panel.style.display = v ? 'block' : 'none';
    document.body.style.paddingBottom = v ? (ui.panel.offsetHeight + 12) + 'px' : '';
    if (!v) clearOutline();
    if (v) document.body.style.paddingBottom = (ui.panel.offsetHeight + 12) + 'px';
  }
  ui.fab.addEventListener('click', function (e) { e.stopPropagation(); setActive(!active); });
  ui.close.addEventListener('click', function () { setActive(false); });
  document.addEventListener('click', function (e) {
    if (!active || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    select(e.target);
  }, true);
  ui.tt.addEventListener('click', function () { tab = 'text'; ui.tt.classList.add('on'); ui.tb.classList.remove('on'); if (sel) load(); });
  ui.tb.addEventListener('click', function () { tab = 'bg'; ui.tb.classList.add('on'); ui.tt.classList.remove('on'); if (sel) load(); });
  ['h', 's', 'l'].forEach(function (k, i) { ui[k].addEventListener('input', function () { if (!sel) return; hsl[i] = parseFloat(ui[k].value); applyHsl(); }); });
  ui.hex.addEventListener('change', function () {
    var c = fromHex(ui.hex.value.trim()); if (!c || !sel) return;
    var h = rgb2hsl(c[0], c[1], c[2]); hsl = [h[0], h[1], h[2]]; refreshSliders(); applyHsl();
  });
  ui.all.addEventListener('click', function () { all = !all; ui.all.textContent = 'Усі такі самі: ' + (all ? 'так' : 'ні'); ui.all.classList.toggle('on', all); });
  ui.reset.addEventListener('click', resetAll);
  ui.copy.addEventListener('click', function () {
    var t = summary();
    var done = function () { ui.log.textContent = 'Скопійовано:\n' + t; };
    try { navigator.clipboard.writeText(t).then(done, function () { ui.log.textContent = t; }); } catch (e) { ui.log.textContent = t; }
    ui.log.style.whiteSpace = 'pre-wrap';
  });
  window.addEventListener('resize', function () { if (active) document.body.style.paddingBottom = (ui.panel.offsetHeight + 12) + 'px'; });
})();
