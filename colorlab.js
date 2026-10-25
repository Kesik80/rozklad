/* COLORLAB v4 — як Stark/Figma: торкнись елемента → бачиш колір тексту й фону, контраст і чи проходить AA/AAA.
   Вмикання: Info → «Підбір кольору» (або ?colorlab=1 / ?colorlab=0).
   Торкнись «Текст» або «Фон» — відкриється системний вибір кольору. «Підігнати до AA» — найближчий колір, що проходить.
   «✓ Залишити» — зафіксувати правку; інакше вона скасується при торканні іншого елемента. 🌓 — тема. «Копіювати» — звіт для app.css. */
(function () {
  'use strict';
  var KEY = 'colorlab';
  try { var q = /[?&]colorlab=([01])/.exec(location.search); if (q) localStorage.setItem(KEY, q[1]); } catch (e) {}
  var enabled = false;
  try { enabled = localStorage.getItem(KEY) === '1'; } catch (e) {}
  window.ColorLab = { enabled: function () { return enabled; }, set: function (v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} } };
  if (!enabled) return;

  var VARS = ['--bg-0', '--bg-1', '--bg-2', '--label', '--label-2', '--label-3', '--separator', '--accent', '--next', '--th', '--hint', '--red', '--wd', '--ok', '--th-bg', '--key'];
  var FG = 'color', BG = 'background-color';

  function parse(c) {
    if (!c) return [0, 0, 0, 0];
    var m = /rgba?\(([^)]+)\)/.exec(c);
    if (m) { var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    m = /color\(srgb\s+([^)]+)\)/.exec(c);
    if (m) { var q = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat); return [q[0] * 255, q[1] * 255, q[2] * 255, q.length > 3 ? q[3] : 1]; }
    return [0, 0, 0, 0];
  }
  function hex(r, g, b) { return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function fromHex(h) { h = h.replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
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
  function blend(t, b) { var a = t[3]; return [t[0] * a + b[0] * (1 - a), t[1] * a + b[1] * (1 - a), t[2] * a + b[2] * (1 - a), 1]; }
  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function bgOf(el) {
    var stack = [], n = el;
    while (n && n.nodeType === 1) { var c = parse(getComputedStyle(n).backgroundColor); if (c[3] > 0) stack.push(c); if (c[3] >= .999) break; n = n.parentElement; }
    var res = theme() === 'dark' ? [11, 15, 23, 1] : [255, 255, 255, 1];
    for (var i = stack.length - 1; i >= 0; i--) res = blend(stack[i], res);
    return res;
  }
  function varName(c) {
    var probe = document.createElement('i'); probe.style.cssText = 'position:absolute;visibility:hidden'; document.body.appendChild(probe);
    var found = [];
    VARS.forEach(function (v) { probe.style.color = 'var(' + v + ')'; var pc = parse(getComputedStyle(probe).color); if (Math.abs(pc[0] - c[0]) < 1.5 && Math.abs(pc[1] - c[1]) < 1.5 && Math.abs(pc[2] - c[2]) < 1.5) found.push(v); });
    probe.remove(); return found;
  }
  function describe(el) {
    var s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id;
    var cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.'); return s;
  }
  function col(prop) { if (!sel) return [0, 0, 0, 1]; return prop === FG ? parse(getComputedStyle(sel).color) : bgOf(sel); }
  function H(c) { return hex(c[0], c[1], c[2]); }

  var sel = null, all = false, cur = null, committed = [], outlined = null, last = FG;
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function $(id) { return document.getElementById(id); }

  var css = document.createElement('style');
  css.textContent =
    '#cl-fab{position:fixed;right:12px;bottom:12px;z-index:2147483001;width:46px;height:46px;border-radius:50%;border:2px solid #fff;background:#222;color:#fff;font-size:22px;line-height:1;box-shadow:0 2px 10px rgba(0,0,0,.5);padding:0}' +
    '#cl-fab.on{background:#d6249f}' +
    '#cl-panel{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#15171c;color:#eef0f4;font:13px/1.35 -apple-system,Roboto,sans-serif;padding:10px 12px 70px;border-top:2px solid #d6249f;max-height:60vh;overflow:auto;display:none}' +
    '#cl-panel *{box-sizing:border-box;font-family:inherit}' +
    '#cl-panel .r{display:flex;align-items:center;gap:8px;margin:6px 0}' +
    '#cl-panel .sm{opacity:.7;font-size:12px;word-break:break-all}' +
    '#cl-panel button{background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:8px 10px;font-size:13px}' +
    '#cl-panel .pair{display:flex;gap:8px;align-items:stretch}' +
    '#cl-panel .box{flex:1;border-radius:12px;border:1px solid #555;padding:10px;text-align:center;position:relative;min-height:84px;display:flex;flex-direction:column;justify-content:center}' +
    '#cl-panel .box b{font-size:16px}#cl-panel .box small{font-size:11px;opacity:.85}' +
    '#cl-panel .box input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0}' +
    '#cl-panel .box.sel{outline:2px solid #d6249f}' +
    '#cl-panel .big{text-align:center;margin:8px 0 4px}#cl-panel .big b{font-size:30px}' +
    '#cl-panel .bd{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}' +
    '#cl-panel .bd span{border-radius:8px;padding:4px 8px;font-size:12px;border:1px solid #3a4150}' +
    '#cl-panel .bd .p{background:#12351f;border-color:#2ea043;color:#7ee787}#cl-panel .bd .f{background:#3b1717;border-color:#8b2b2b;color:#ff9b93}' +
    '#cl-panel .cm{display:flex;align-items:center;gap:6px;margin:3px 0;font-size:12px}#cl-panel .cm span{flex:1;min-width:0;word-break:break-all}' +
    '#cl-panel .cm i{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #666;vertical-align:-2px}' +
    '#cl-bar{position:fixed;left:0;right:64px;bottom:0;z-index:2147483000;background:#15171c;padding:8px 0 10px 12px;display:none;gap:6px;flex-wrap:nowrap;overflow-x:auto}' +
    '#cl-bar button{flex:none;background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:9px 10px;font-size:13px;white-space:nowrap}' +
    '#cl-bar button.on{background:#d6249f;border-color:#d6249f}#cl-bar button.ok2{background:#238636;border-color:#2ea043;font-weight:700}';
  document.head.appendChild(css);

  var fab = el('button', { id: 'cl-fab', type: 'button', 'aria-label': 'Підбір кольору' }, '🎨');
  var panel = el('div', { id: 'cl-panel' }), bar = el('div', { id: 'cl-bar' });
  panel.innerHTML =
    '<div class="r"><div class="sm" id="cl-name" style="flex:1;font-size:13px;opacity:.9">Торкнись слова або фону</div><button id="cl-theme" type="button" style="font-size:18px;padding:6px 10px" aria-label="Тема">🌓</button></div>' +
    '<div class="pair"><div class="box" id="cl-bfg"><b>Текст</b><span id="cl-hfg"></span><small id="cl-vfg"></small><input type="color" id="cl-ifg"></div>' +
    '<div class="box" id="cl-bbg"><b>Фон</b><span id="cl-hbg"></span><small id="cl-vbg"></small><input type="color" id="cl-ibg"></div></div>' +
    '<div class="big"><b id="cl-ratio">—</b></div><div class="bd" id="cl-bd"></div>' +
    '<div class="r" style="justify-content:center"><button id="cl-fixfg" type="button">Підігнати текст до AA</button><button id="cl-fixbg" type="button">Підігнати фон до AA</button></div>' +
    '<div class="sm" id="cl-log" style="white-space:pre-wrap"></div>' +
    '<div class="sm" style="margin-top:8px">Залишені правки:</div><div id="cl-list" class="sm">—</div>';
  bar.innerHTML = '<button id="cl-fix" class="ok2" type="button">✓ Залишити</button><button id="cl-reset" type="button">↶ Скасувати</button><button id="cl-all" type="button">Усі такі: ні</button><button id="cl-copy" type="button">Копіювати</button><button id="cl-close" type="button">✕</button>';
  document.body.appendChild(fab); document.body.appendChild(panel); document.body.appendChild(bar);
  var ui = {};
  ['name', 'theme', 'bfg', 'bbg', 'hfg', 'hbg', 'vfg', 'vbg', 'ifg', 'ibg', 'ratio', 'bd', 'fixfg', 'fixbg', 'log', 'list', 'fix', 'reset', 'all', 'copy', 'close'].forEach(function (k) { ui[k] = $('cl-' + k); });
  function say(t) { ui.log.textContent = t; }
  function inUi(t) { return t === fab || panel.contains(t) || bar.contains(t); }

  function show() {
    if (!sel) return;
    var f = col(FG), b = col(BG), r = ratio(f, b);
    ui.bfg.style.background = H(b); ui.bfg.querySelectorAll('b,span,small').forEach(function (n) { n.style.color = H(f); });
    ui.bbg.style.background = H(b); ui.bbg.querySelectorAll('b,span,small').forEach(function (n) { n.style.color = H(f); });
    ui.hfg.textContent = H(f); ui.hbg.textContent = H(b);
    var vf = varName(f), vb = varName(b);
    ui.vfg.textContent = vf.join(' / '); ui.vbg.textContent = vb.join(' / ');
    ui.ifg.value = H(f); ui.ibg.value = H(b);
    ui.bfg.classList.toggle('sel', last === FG); ui.bbg.classList.toggle('sel', last === BG);
    ui.ratio.innerHTML = r.toFixed(2) + ' : 1';
    ui.bd.innerHTML = [['AA текст', 4.5], ['AA великий', 3], ['AAA текст', 7], ['AAA великий', 4.5]].map(function (x) { return '<span class="' + (r >= x[1] ? 'p' : 'f') + '">' + (r >= x[1] ? '✓ ' : '✗ ') + x[0] + '</span>'; }).join('');
    ui.name.textContent = describe(sel) + (sel.children.length ? '' : ' — «' + (sel.textContent || '').trim().slice(0, 22) + '»') + ' · ' + theme() + (cur ? ' · не залишено' : '');
    ui.fix.classList.toggle('on', !!cur);
    renderList();
  }

  /* перегляд / фіксація */
  function targets(prop, origRgb) {
    cur.t = cur.t || {};
    if (cur.t[prop] && cur.tAll === all) return cur.t[prop];
    var out = [sel];
    if (all) {
      var key = origRgb.map(Math.round).join(','), list = document.body.querySelectorAll('*');
      for (var i = 0; i < list.length; i++) {
        var n = list[i]; if (inUi(n) || n === sel) continue;
        var cs = getComputedStyle(n), c = prop === FG ? parse(cs.color) : parse(cs.backgroundColor);
        if (c[3] > 0 && c.slice(0, 3).map(Math.round).join(',') === key) out.push(n);
      }
    }
    cur.t[prop] = out; cur.tAll = all; return out;
  }
  function setColor(prop, hx) {
    if (!sel) return;
    if (!cur) cur = { saved: [], entries: {}, orig: {}, t: {}, tAll: all, theme: theme() };
    if (!cur.orig[prop]) cur.orig[prop] = col(prop).slice(0, 3);
    var list = targets(prop, cur.orig[prop]), mk = '__cl_' + prop;
    list.forEach(function (n) {
      if (n[mk] !== cur) { cur.saved.push({ n: n, p: prop, old: n.style.getPropertyValue(prop), pr: n.style.getPropertyPriority(prop) }); n[mk] = cur; }
      n.style.setProperty(prop, hx, 'important');
    });
    var e = cur.entries[prop];
    if (!e) e = cur.entries[prop] = { el: describe(sel), text: (sel.textContent || '').trim().slice(0, 22), prop: prop === FG ? 'текст' : 'фон', from: H(cur.orig[prop]), vars: varName(cur.orig[prop].concat([1])), theme: theme() };
    e.to = hx; e.n = list.length; e.all = all;
    last = prop; say('Перегляд: ' + e.prop + ' ' + e.from + ' → ' + hx + (list.length > 1 ? ' (' + list.length + ' ел.)' : '') + '\nНатисни «✓ Залишити», щоб зберегти.');
    show();
  }
  function restore(s) { if (s.old) s.n.style.setProperty(s.p, s.old, s.pr); else s.n.style.removeProperty(s.p); }
  function revertPreview() { if (!cur) return; for (var i = cur.saved.length - 1; i >= 0; i--) { restore(cur.saved[i]); delete cur.saved[i].n['__cl_' + cur.saved[i].p]; } cur = null; }
  function commit() {
    if (!cur || !cur.saved.length) { say('Немає що залишати'); return; }
    cur.saved.forEach(function (s) { s.neu = s.n.style.getPropertyValue(s.p); delete s.n['__cl_' + s.p]; });
    Object.keys(cur.entries).forEach(function (k) { committed.push({ e: cur.entries[k], saved: cur.saved.filter(function (s) { return s.p === k; }), active: true }); });
    cur = null; say('✓ Залишено'); show();
  }
  function renderList() {
    if (!committed.length) { ui.list.textContent = '— поки нічого'; return; }
    ui.list.innerHTML = '';
    committed.forEach(function (c, i) {
      var e = c.e, row = el('div', { class: 'cm', style: c.active ? '' : 'opacity:.45' });
      row.innerHTML = '<span>' + e.theme + ' · ' + e.el + (e.text ? ' «' + e.text + '»' : '') + ' [' + e.prop + '] <i style="background:' + e.from + '"></i>→<i style="background:' + e.to + '"></i> ' + e.to + (e.all ? ' ×' + e.n : '') + '</span>';
      var b = el('button', { type: 'button' }, '✕'); b.addEventListener('click', function () { if (c.active) c.saved.slice().reverse().forEach(restore); committed.splice(i, 1); show(); }); row.appendChild(b); ui.list.appendChild(row);
    });
  }
  function summary() {
    var pg = document.body.getAttribute('data-page') || location.pathname, lines = ['Сторінка: ' + pg];
    committed.forEach(function (c) { var e = c.e; lines.push('• [' + e.theme + '] ' + e.el + (e.text ? ' «' + e.text + '»' : '') + ' [' + e.prop + ']: ' + e.from + (e.vars.length ? ' (' + e.vars.join('/') + ')' : '') + ' → ' + e.to + (e.all ? ' · усі такі самі (' + e.n + ' ел.)' : '')); });
    if (cur) lines.push('(є непідтверджена правка — не включено)');
    return lines.join('\n');
  }
  function switchTheme() {
    var from = theme(), nx = from === 'dark' ? 'light' : 'dark';
    revertPreview();
    committed.forEach(function (c) { if (c.e.theme === from && c.active) { c.saved.slice().reverse().forEach(restore); c.active = false; } });
    try { localStorage.setItem('theme', nx); } catch (e) {}
    if (window.Rozklad && Rozklad.applyTheme) Rozklad.applyTheme(nx); else document.documentElement.setAttribute('data-theme', nx);
    committed.forEach(function (c) { if (c.e.theme === nx && !c.active) { c.saved.forEach(function (s) { s.n.style.setProperty(s.p, s.neu, 'important'); }); c.active = true; } });
    say('Тема: ' + nx); show();
  }

  /* «Підігнати до AA» — найближчий за яскравістю колір, що проходить 4.5:1 (відтінок і насиченість зберігаються) */
  function fixTo(prop) {
    if (!sel) return;
    var f = col(FG), b = col(BG), mv = prop === FG ? f : b, fixed = prop === FG ? b : f;
    if (ratio(f, b) >= 4.5) { say('Уже проходить AA'); return; }
    var h = rgb2hsl(mv[0], mv[1], mv[2]), best = null, bd = 1e9;
    for (var l = 0; l <= 100; l += .5) { var c = hsl2rgb(h[0], h[1], l); if (ratio(c, fixed) >= 4.5 && Math.abs(l - h[2]) < bd) { bd = Math.abs(l - h[2]); best = c; } }
    if (!best) { say('Не вдалося підібрати: зміни інший колір'); return; }
    setColor(prop, H(best));
  }

  /* події */
  function setActive(v) { fab.classList.toggle('on', v); panel.style.display = v ? 'block' : 'none'; bar.style.display = v ? 'flex' : 'none'; document.body.style.paddingBottom = v ? (panel.offsetHeight + 12) + 'px' : ''; if (!v && outlined) { outlined.el.style.outline = outlined.o; outlined = null; } active = v; }
  var active = false;
  fab.addEventListener('click', function (e) { e.stopPropagation(); setActive(!active); });
  ui.close.addEventListener('click', function () { setActive(false); });
  document.addEventListener('click', function (e) {
    if (!active || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if (e.target !== sel && cur) { revertPreview(); say('Непідтверджену правку скасовано'); }
    if (outlined) { outlined.el.style.outline = outlined.o; outlined.el.style.outlineOffset = outlined.f; }
    sel = e.target; outlined = { el: sel, o: sel.style.outline, f: sel.style.outlineOffset };
    sel.style.outline = '2px dashed #d6249f'; sel.style.outlineOffset = '1px';
    show();
  }, true);
  ui.ifg.addEventListener('input', function () { setColor(FG, ui.ifg.value); });
  ui.ibg.addEventListener('input', function () { setColor(BG, ui.ibg.value); });
  ui.fixfg.addEventListener('click', function () { fixTo(FG); });
  ui.fixbg.addEventListener('click', function () { fixTo(BG); });
  ui.all.addEventListener('click', function () { all = !all; ui.all.textContent = 'Усі такі: ' + (all ? 'так' : 'ні'); ui.all.classList.toggle('on', all); if (cur) { revertPreview(); say('Режим змінено — перегляд скинуто'); show(); } });
  ui.fix.addEventListener('click', commit);
  ui.reset.addEventListener('click', function () { if (!cur) { say('Немає непідтвердженої правки'); return; } revertPreview(); say('Скасовано'); show(); });
  ui.theme.addEventListener('click', switchTheme);
  ui.copy.addEventListener('click', function () { var t = summary(), done = function () { say('Скопійовано:\n' + t); }; try { navigator.clipboard.writeText(t).then(done, function () { say(t); }); } catch (e) { say(t); } });
  window.addEventListener('resize', function () { if (active) document.body.style.paddingBottom = (panel.offsetHeight + 12) + 'px'; });
  renderList();
})();
