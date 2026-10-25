/* COLORLAB v5 — подбор цветовой схемы «как Realtime Colors».
   Включение: Info → «Подбор цвета» (или ?colorlab=1 / ?colorlab=0 в адресе).
   Как работает: меняются не отдельные слова, а ЦВЕТОВЫЕ РОЛИ всей страницы (переменные CSS):
     Фон, Карточки, Текст, Второй текст, Акцент, Выделение, Линии, Плашка.
   Выбираешь только два главных цвета — Фон и Акцент (семейство Radix или свой цвет),
   остальные роли считаются сами (контраст ≥ 4.5 / 7 гарантируется). 🎲 — случайная схема.
   Ручная правка любой роли блокирует её 🔒 — случайный подбор её не трогает.
   Схема действует на ВСЕХ страницах сразу (хранится на телефоне), светлая и тёмная темы — отдельно.
   «Копировать CSS» — готовый блок переменных, пришли его мне, и я впишу в app.css. */
(function () {
  'use strict';
  var KEY = 'colorlab', PKEY = 'colorlab-pal';
  try { var q = /[?&]colorlab=([01])/.exec(location.search); if (q) localStorage.setItem(KEY, q[1]); } catch (e) {}
  var enabled = false;
  try { enabled = localStorage.getItem(KEY) === '1'; } catch (e) {}
  window.ColorLab = { enabled: function () { return enabled; }, set: function (v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} } };
  if (!enabled) return;

  var RDX={"gray":["fcfcfcf9f9f9f0f0f0e8e8e8e0e0e0d9d9d9cececebbbbbb8d8d8d838383646464202020","1111111919192222222a2a2a3131313a3a3a4848486060606e6e6e7b7b7bb4b4b4eeeeee"],"mauve":["fdfcfdfaf9fbf2eff3eae7ece3dfe6dbd8e0d0cdd7bcbac78e8c9984828e65636d211f26","1211131a191b2322252b292d3230353c393f49474e625f696f6d787c7a85b5b2bceeeef0"],"slate":["fcfcfdf9f9fbf0f0f3e8e8ece0e1e6d9d9e0cdced6b9bbc68b8d9880838d60646c1c2024","11111318191b212225272a2d2e3135363a3f43484e5a6169696e77777b84b0b4baedeef0"],"sage":["fbfdfcf7f9f8eef1f0e6e9e8dfe2e0d7dad9cbcfcdb8bcba868e8b7c84815f65631a211e","101211171918202221272a292e3130373b394449475b625f63706b717d79adb5b2eceeed"],"olive":["fcfdfcf8faf8eff1efe7e9e7dfe2dfd7dad7cccfccb9bcb8898e877f847d60655f1d211c","111210181917212220282a272f312e383a364548435c625b687066767d74afb5adeceeec"],"sand":["fdfdfcf9f9f8f1f0efe9e8e6e2e1dedad9d6cfcecabcbbb58d8d8682827c63635e21201c","1111101919182222212a2a2831312e3b3a3749484462605b6f6d667c7b74b5b3adeeeeec"],"tomato":["fffcfcfff8f7feebe7ffdcd3ffcdc2fdbdaff5a898ec8e7be54d2edd4425d134155c271f","1811111f15133917144e15115e1c166e2920853a2dac4d39e54d2eec6142ff977dfbd3cb"],"red":["fffcfcfff7f7feebecffdbdcffcdcefdbdbef4a9aaeb8e90e5484ddc3e42ce2c31641723","1911112013143b1219500f1c61162372232d8c333ab54548e5484dec5d5eff9592ffd1d9"],"ruby":["fffcfdfff7f8feeaedffdce1ffced6f8bfc8efacb8e592a3e54666dc3b5dca244d64172b","1911131e15173a141e4e13255e1a2e6f2539883447b3445ae54666ec5a72ff949dfed2e1"],"crimson":["fffcfdfef7f9ffe9f0fedce7faceddf3bed1eaacc3e093b2e93d82df3478cb1d63621639","1911142013183815254d122f5c18396d2545873356b0436ee93d82ee518aff92adfdd3e8"],"pink":["fffcfefef7fbfee9f5fbdceff6cee7efbfdde7acd0dd93c2d6409fcf3897c2298a651249","19111721121d37172f4b143d591c47692955833869a84885d6409fde51a8ff8dccfdd1ea"],"plum":["fefcfffdf7fdfbebfbf7def8f2d1f3e9c2ecdeade3cf91d8ab4abaa144af953ea353195d","181118201320351a35451d475124545e306173407992549cab4abab658c4e796f3f4d4f4"],"purple":["fefcfefbf7fef7edfef2e2fcead5f9e0c4f4d1afecbe93e48e4ec68347b98145b5402060","18111b1e1523301c3b3d224e48295c54346b6642828457aa8e4ec69a5cd0d19dffecd9fa"],"violet":["fdfcfefaf8fff4f0feebe4ffe1d9ffd4cafec2b5f5aa99ec6e56cf654dc46550b92f265f","14121f1b1525291f4333255b3c2e6947387656468b6958ad6e56cf7d66d9baa7ffe2ddfe"],"iris":["fdfdfff8f8fff0f1fee6e7ffdadcffcbcdffb8baf89b9ef05b5bd65151cd5753c6272962","13131e171625202248262a653033743d3e824a4a955958b15b5bd66e6adeb1a9ffe0dffe"],"indigo":["fdfdfef7f9ffedf2fee1e9ffd2deffc1d0ffabbdf98da4ef3e63dd3358d43a5bc71f2d5c","11131f1417261824491d2e622539743043843a4f97435db13e63dd5472e49eb1ffd6e1ff"],"blue":["fbfdfff4faffe6f4fed5efffc2e5ffacd8fc8ec8f65eb1ef0090ff0588f00d74ce113264","0d15201119270d2847003362004074104d87205d9e2870bd0090ff3b9eff70b8ffc2e6ff"],"cyan":["fafdfef2fafbdef7f9caf1f6b5e9f09ddde77dcedc3db9cf00a2c70797b9107d980d3c48","0b161a101b20082c3600384800455804546812677e11809c00a2c723afd04ccce6b6ecf7"],"teal":["fafefdf3fbf9e0f8f3ccf3eab8eae0a1ded283cdc153b9ab12a5940d9b8a0085730d3d38","0d1514111c1b0d2d2a023b370848431457501c6961207e7312a5940eb39e0bd8b6adf0dd"],"jade":["fbfefdf4fbf7e6f7edd6f1e3c3e9d7acdec88bceb656ba9f29a38326997b2083681d3b31","0d1512121c180f2e220b3b2c1148371b57452468542a7e6829a38327b08b1fd8a4adf0d4"],"green":["fbfefcf4fbf6e6f6ebd6f1dfc4e8d1adddc08eceaa5bb98b30a46c2b9a66218358193b2d","0e1512121b17132d21113b2917493320573e28684a2f7c5730a46c33b0743dd68cb1f1cb"],"grass":["fbfefbf5fbf5e9f6e9daf1dbc9e8cab2ddb594ce9a65ba7446a7583e9b4f2a7e3b203c25","0e1511141a151b2a1e1d3a2425482d2d57363667403e794946a75853b36571d083c2f0c2"],"bronze":["fdfcfcfdf7f5f6edeaefe4dfe7d9d3dfcdc5d3bcb3c2a499a180729574687d5e5443302b","1411101c1917262220302a273b3330493e3a5a4c476f5f58a18072ae8c7ed4b3a5ede0d9"],"gold":["fdfdfcfaf9f2f2f0e7eae6dbe1dccfd8d0bfcbc0aab9a88d9783658c7a5e71624b3b352b","1212111b1a1724231f2d2b2638352e444039544f46696256978365a39073cbb99fe8e2d9"],"brown":["fefdfcfcf9f6f6eee7f0e4d9ebdacae4cdb7dcbc9fcea37ead7f58a07553815e463e332e","12110f1c181628211d3229223e31284d3c2f614a397c5f46ad7f58b88c67dbb594f2e1ca"],"orange":["fefcfbfff7edffefd6ffdfb5ffd19affc182f5ae73ec9455f76b15ef5f00cc4e00582d1d","17120e1e160f331e0b46210056280066350c7e451da35829f76b15ff801fffa057ffe0c2"],"amber":["fefdfbfefbe9fff7c2ffee9cfbe577f3d673e9c162e2a336ffc53dffba18ab64004f3422","16120c1d180f3020083f27004d30005c3d05714f198f6424ffc53dffd60affca16ffe7b3"],"yellow":["fdfdf9fefce9fffab8fff394ffe770f3d768e4c767d5ae39ffe629ffdc009e6c00473b1f","14120b1b180f2d2305362b00433500524202665417836a21ffe629ffff57f5e147f6eeb4"],"lime":["fcfdfaf8faf3eef6d6e2f0bdd3e7a6c2da91abc9788db654bdee63b0e64c5c7c2f37401c","11130c151a101f291729371d3344233d522a496231577538bdee63d4ff70bde56ce3f7ba"],"mint":["f9fefdf2fbf9ddf9f2c8f4e9b3ecde9ce0d07ecfbd4cbba586ead47de0cb02786416433c","0e15150f1b1b092c2b003a380047441056501e685f277f7086ead4a8f5e558d5bac4f5e1"],"sky":["f9fefff1fafde1f6fdd1f0fabee7f5a9daed8dcae360b3d77ce2fe74daf800749e1d3e56","0d141f111a271128401135551544671b537b1f6692197cae7ce2fea8eeff75c7f0c2f3ff"]};
  var ORDER = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand', 'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'sky', 'cyan', 'teal', 'jade', 'mint', 'green', 'grass', 'lime', 'yellow', 'amber', 'orange', 'brown', 'bronze', 'gold'];
  var NEUTRAL = { gray: 1, mauve: 1, slate: 1, sage: 1, olive: 1, sand: 1 };
  var ROLES = [
    { id: 'bg', name: 'Фон', vars: ['--bg-0'] },
    { id: 'card', name: 'Карточки', vars: ['--bg-1', '--bg-2'] },
    { id: 'text', name: 'Текст', vars: ['--label', '--label-3'] },
    { id: 'text2', name: 'Второй текст', vars: ['--label-2', '--hint'] },
    { id: 'accent', name: 'Акцент', vars: ['--accent'] },
    { id: 'key', name: 'Выделение', vars: ['--key', '--next', '--th'] },
    { id: 'line', name: 'Линии', vars: ['--separator'] },
    { id: 'plate', name: 'Плашка', vars: ['--th-bg'] }
  ];
  var ROLE = {}; ROLES.forEach(function (r) { ROLE[r.id] = r; });

  /* ---------- цвет ---------- */
  function hex(r, g, b) { return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function rgb(h) { h = (h || '').replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(h)) return [0, 0, 0]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn; if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; }
  function fromHsl(h, s, l) { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; } return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; }
  function lum(c) { var f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); }
  function ratio(a, b) { var x = lum(rgb(a)), y = lum(rgb(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex(x[0] * (1 - t) + y[0] * t, x[1] * (1 - t) + y[1] * t, x[2] * (1 - t) + y[2] * t); }
  function fix(c, bg, min) {             // ближайшая по яркости версия цвета с контрастом ≥ min (тон и насыщенность сохраняются)
    if (ratio(c, bg) >= min) return c;
    var h = hsl(rgb(c)), best = null, bd = 1e9;
    for (var l = 0; l <= 100; l += .5) { var k = hex.apply(null, fromHsl(h[0], h[1], l)); if (ratio(k, bg) >= min && Math.abs(l - h[2]) < bd) { bd = Math.abs(l - h[2]); best = k; } }
    return best || (lum(rgb(bg)) > .4 ? '#000000' : '#ffffff');
  }
  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function ti() { return theme() === 'dark' ? 1 : 0; }
  function step(f, n) { return '#' + RDX[f][ti()].substr((n - 1) * 6, 6); }

  /* ---------- состояние ---------- */
  var P = { light: {}, dark: {} };
  try { var sv = JSON.parse(localStorage.getItem(PKEY) || 'null'); if (sv && sv.light && sv.dark) P = sv; } catch (e) {}
  function save() { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} }
  var ORIG = {}, applied = [];
  function readVars() {
    var o = {}, pr = document.createElement('i'); pr.style.cssText = 'position:absolute;visibility:hidden'; document.body.appendChild(pr);
    ROLES.forEach(function (r) { r.vars.forEach(function (v) { pr.style.color = 'var(' + v + ')'; var m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(pr).color); if (m) { var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); o[v] = hex(p[0], p[1], p[2]); } }); });
    pr.remove(); return o;
  }
  function clearInline() { applied.forEach(function (v) { document.documentElement.style.removeProperty(v); }); applied = []; }

  /* вычисление всех ролей по Фону и Акценту */
  function compute() {
    var S = P[theme()], O = ORIG[theme()], out = {};
    function orole(id) { return O[ROLE[id].vars[0]]; }
    var bg = S.bg || orole('bg'), accent = S.accent || orole('accent'), auto = !!(S.bg || S.accent || S.auto);
    var d = lum(rgb(bg)) < .2, hh = hsl(rgb(bg)), fam = S.fam;
    var card, text, text2, line, plate, key;
    if (auto) {
      if (fam && RDX[fam]) { card = step(fam, 2); text = step(fam, 12); text2 = step(fam, 11); line = step(fam, d ? 5 : 6); }
      else {
        card = d ? hex.apply(null, fromHsl(hh[0], hh[1], Math.min(100, hh[2] + 4))) : (hh[2] > 92 ? '#ffffff' : hex.apply(null, fromHsl(hh[0], hh[1], Math.min(100, hh[2] + 4))));
        text = hex.apply(null, fromHsl(hh[0], Math.min(hh[1], 18), d ? 95 : 9));
        text2 = hex.apply(null, fromHsl(hh[0], Math.min(hh[1], 14), d ? 72 : 40));
        line = mix(card, text, .14);
      }
      text = fix(text, card, 7); text2 = fix(text2, card, 4.5);
      key = fix(accent, card, 4.5); plate = mix(card, accent, d ? .16 : .12);
    } else { card = orole('card'); text = orole('text'); text2 = orole('text2'); line = orole('line'); key = orole('key'); plate = orole('plate'); }
    out = { bg: bg, card: card, text: text, text2: text2, accent: accent, key: key, line: line, plate: plate };
    ROLES.forEach(function (r) { if (S.over && S.over[r.id]) out[r.id] = S.over[r.id]; });
    return out;
  }
  function apply() {
    clearInline();
    var S = P[theme()], V = compute(), O = ORIG[theme()], root = document.documentElement.style, any = false;
    ROLES.forEach(function (r) {
      r.vars.forEach(function (v) { if (V[r.id] && V[r.id] !== O[v]) { root.setProperty(v, V[r.id]); applied.push(v); any = true; } });
    });
    if (V.accent) { var at = ratio('#ffffff', V.accent) >= ratio('#000000', V.accent) ? '#ffffff' : '#000000'; if ((S.bg || S.accent || S.over && S.over.accent) ) { root.setProperty('--accent-text', at); applied.push('--accent-text'); } }
    var m = document.getElementById('themeColorMeta'); if (m && V.bg) m.setAttribute('content', V.bg);
    return V;
  }
  function randomize() {
    var S = P[theme()], L = S.lock || {}, dark = ti() === 1;
    S.over = S.over || {};
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    if (!L.bg) { S.fam = pick(ORDER); S.bg = step(S.fam, 1); }
    if (!L.accent) { var f = pick(['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'blue', 'indigo', 'violet', 'pink', 'crimson', 'tomato']); S.accent = step(f, 9); S.accentFam = f; }
    S.auto = true;
    ROLES.forEach(function (r) { if (!L[r.id] && S.over[r.id]) delete S.over[r.id]; });
    commit();
  }
  function commit() { save(); render(); apply(); render(); }

  /* ---------- интерфейс ---------- */
  var css = document.createElement('style');
  css.textContent =
    '#cl-fab{position:fixed;right:12px;bottom:12px;z-index:2147483001;width:46px;height:46px;border-radius:50%;border:2px solid #fff;background:#222;color:#fff;font-size:22px;line-height:1;box-shadow:0 2px 10px rgba(0,0,0,.5);padding:0}' +
    '#cl-fab.on{background:#d6249f}' +
    '#cl-panel{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#15171c;color:#eef0f4;font:13px/1.35 -apple-system,Roboto,sans-serif;padding:10px 12px 70px;border-top:2px solid #d6249f;max-height:64vh;overflow:auto;display:none}' +
    '#cl-panel *{box-sizing:border-box;font-family:inherit}' +
    '#cl-panel .r{display:flex;align-items:center;gap:8px;margin:6px 0}' +
    '#cl-panel .sm{opacity:.7;font-size:12px}' +
    '#cl-panel .h{font-size:12px;opacity:.85;margin:10px 0 3px;font-weight:600}' +
    '#cl-panel button{background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:8px 10px;font-size:13px}' +
    '#cl-panel .chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}' +
    '#cl-panel .chips button{flex:none;width:34px;height:34px;border-radius:50%;padding:0;border:2px solid #3a4150}' +
    '#cl-panel .chips button.on{border-color:#fff;box-shadow:0 0 0 2px #d6249f}' +
    '#cl-panel .role{display:flex;align-items:center;gap:10px;margin:7px 0}' +
    '#cl-panel .role .sw{width:44px;height:44px;border-radius:10px;border:1px solid #666;position:relative;flex:none}' +
    '#cl-panel .role .sw input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0}' +
    '#cl-panel .role .t{flex:1;min-width:0}#cl-panel .role .t b{font-size:14px}' +
    '#cl-panel .role .rt{font-size:12px;padding:3px 7px;border-radius:7px;border:1px solid #3a4150;flex:none}' +
    '#cl-panel .rt.p{background:#12351f;border-color:#2ea043;color:#7ee787}#cl-panel .rt.m{background:#3a2f10;border-color:#9e6a03;color:#e3b341}#cl-panel .rt.f{background:#3b1717;border-color:#8b2b2b;color:#ff9b93}' +
    '#cl-panel .role .lk{padding:6px 8px;font-size:15px;flex:none}#cl-panel .role .lk.on{background:#d6249f;border-color:#d6249f}' +
    '#cl-bar{position:fixed;left:0;right:64px;bottom:0;z-index:2147483000;background:#15171c;padding:8px 0 10px 12px;display:none;gap:6px;flex-wrap:nowrap;overflow-x:auto}' +
    '#cl-bar button{flex:none;background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:9px 10px;font-size:13px;white-space:nowrap}#cl-bar button.ok2{background:#238636;border-color:#2ea043;font-weight:700}';
  document.head.appendChild(css);
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  var fab = el('button', { id: 'cl-fab', type: 'button', 'aria-label': 'Подбор цвета' }, '🎨');
  var panel = el('div', { id: 'cl-panel' }), bar = el('div', { id: 'cl-bar' });
  panel.innerHTML =
    '<div class="r"><b id="cl-th" style="flex:1;font-size:15px"></b><button id="cl-theme" type="button" style="font-size:18px">🌓 Тема</button><button id="cl-rnd" type="button" style="font-size:18px">🎲</button></div>' +
    '<div class="h">Фон — родина Radix</div><div class="chips" id="cl-fbg"></div>' +
    '<div class="h">Акцент — родина Radix</div><div class="chips" id="cl-fac"></div>' +
    '<div class="h">Роли (тапни по цвету — свой цвет; 🔒 — не менять при 🎲)</div><div id="cl-roles"></div>' +
    '<div class="sm" id="cl-log" style="white-space:pre-wrap;margin-top:8px"></div>';
  bar.innerHTML = '<button id="cl-copy" class="ok2" type="button">Копировать CSS</button><button id="cl-rt" type="button">↶ Сброс темы</button><button id="cl-ra" type="button">Сброс всего</button><button id="cl-close" type="button">✕</button>';
  document.body.appendChild(fab); document.body.appendChild(panel); document.body.appendChild(bar);
  function $(id) { return document.getElementById(id); }
  var active = false;
  function say(t) { $('cl-log').textContent = t; }

  function chipRow(host, key) {
    ORDER.forEach(function (f) {
      var b = el('button', { type: 'button', title: f }); b.__f = f; b.__k = key; b.style.background = '#' + RDX[f][0].substr(key === 'fam' ? 18 : 48, 6);
      b.addEventListener('click', function () {
        var S = P[theme()]; S.over = S.over || {};
        if (key === 'fam') { S.fam = f; S.bg = step(f, 1); delete S.over.bg; } else { S.accent = step(f, 9); S.accentFam = f; delete S.over.accent; }
        S.auto = true; commit();
      });
      host.appendChild(b);
    });
  }
  chipRow($('cl-fbg'), 'fam'); chipRow($('cl-fac'), 'acc');

  function render() {
    var S = P[theme()], V = compute(), L = S.lock || {};
    $('cl-th').textContent = 'Тема: ' + (theme() === 'dark' ? 'тёмная' : 'светлая');
    [['cl-fbg', 'fam'], ['cl-fac', 'accentFam']].forEach(function (x) { Array.prototype.forEach.call($(x[0]).children, function (b) { b.classList.toggle('on', S[x[1]] === b.__f); b.style.background = '#' + RDX[b.__f][ti()].substr(x[1] === 'fam' ? 18 : 48, 6); }); });
    var host = $('cl-roles'); host.innerHTML = '';
    ROLES.forEach(function (r) {
      var v = V[r.id], against = r.id === 'text' || r.id === 'text2' || r.id === 'key' ? V.card : r.id === 'accent' ? V.bg : null, rt = against ? ratio(v, against) : 0;
      var min = r.id === 'text' ? 7 : 4.5, cls = !against ? '' : rt >= min ? 'p' : rt >= 3 ? 'm' : 'f';
      var row = el('div', { class: 'role' });
      row.innerHTML = '<div class="sw" style="background:' + v + '"><input type="color" value="' + v + '"></div><div class="t"><b>' + r.name + '</b><div class="sm">' + v + ' · ' + r.vars.join(' ') + '</div></div>' + (against ? '<span class="rt ' + cls + '">' + rt.toFixed(1) + '</span>' : '');
      var lk = el('button', { type: 'button', class: 'lk' + (L[r.id] ? ' on' : '') }, L[r.id] ? '🔒' : '🔓');
      lk.addEventListener('click', function () { S.lock = S.lock || {}; if (S.lock[r.id]) delete S.lock[r.id]; else S.lock[r.id] = 1; commit(); });
      row.appendChild(lk);
      row.querySelector('input').addEventListener('input', function (e) {
        var c = e.target.value; S.over = S.over || {}; S.lock = S.lock || {};
        if (r.id === 'bg') { S.bg = c; S.fam = null; delete S.over.bg; } else if (r.id === 'accent') { S.accent = c; S.accentFam = null; delete S.over.accent; } else S.over[r.id] = c;
        S.lock[r.id] = 1; S.auto = true; save(); apply(); row.querySelector('.sw').style.background = c;
      });
      row.querySelector('input').addEventListener('change', function () { render(); });
      host.appendChild(row);
    });
  }

  function ensureOrig(t) {
    if (ORIG[t]) return;
    var real = document.documentElement.getAttribute('data-theme');
    clearInline(); document.documentElement.setAttribute('data-theme', t); ORIG[t] = readVars(); document.documentElement.setAttribute('data-theme', real); apply();
  }
  function cssText() {
    var out = [];
    ['light', 'dark'].forEach(function (t) {
      var S = P[t]; if (!S.bg && !S.accent && !S.auto && !(S.over && Object.keys(S.over).length)) return;
      ensureOrig(t);
      // вычисляем роли именно для темы t
      var tmp = compute_for(t); var lines = [];
      ROLES.forEach(function (r) { r.vars.forEach(function (v) { if (tmp[r.id] && tmp[r.id] !== ORIG[t][v]) lines.push('  ' + v + ': ' + tmp[r.id] + ';'); }); });
      if (tmp.accent && tmp.accent !== ORIG[t]['--accent']) lines.push('  --accent-text: ' + (ratio('#ffffff', tmp.accent) >= ratio('#000000', tmp.accent) ? '#ffffff' : '#000000') + ';');
      if (lines.length) out.push('html[data-theme="' + t + '"] {\n' + lines.join('\n') + '\n}');
    });
    return out.join('\n\n') || '/* схема не менялась */';
  }
  function compute_for(t) {   // роли для темы t (если t — не текущая, подставляем её шкалу Radix)
    var cur = theme();
    if (t === cur) return compute();
    var real = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', t);
    var r; try { r = compute(); } finally { document.documentElement.setAttribute('data-theme', real); }
    return r;
  }

  /* ---------- события ---------- */
  function setActive(v) { active = v; fab.classList.toggle('on', v); panel.style.display = v ? 'block' : 'none'; bar.style.display = v ? 'flex' : 'none'; document.body.style.paddingBottom = v ? (panel.offsetHeight + 12) + 'px' : ''; if (v) render(); }
  fab.addEventListener('click', function (e) { e.stopPropagation(); setActive(!active); });
  $('cl-close').addEventListener('click', function () { setActive(false); });
  $('cl-rnd').addEventListener('click', randomize);
  $('cl-theme').addEventListener('click', function () {
    var nx = theme() === 'dark' ? 'light' : 'dark';
    clearInline();
    try { localStorage.setItem('theme', nx); } catch (e) {}
    if (window.Rozklad && Rozklad.applyTheme) Rozklad.applyTheme(nx); else document.documentElement.setAttribute('data-theme', nx);
    if (!ORIG[nx]) ORIG[nx] = readVars();
    apply(); render();
  });
  $('cl-rt').addEventListener('click', function () { P[theme()] = {}; commit(); say('Тема сброшена'); });
  $('cl-ra').addEventListener('click', function () { P = { light: {}, dark: {} }; commit(); say('Всё сброшено'); });
  $('cl-copy').addEventListener('click', function () {
    var t = cssText(), done = function () { say('Скопировано:\n' + t); };
    try { navigator.clipboard.writeText(t).then(done, function () { say(t); }); } catch (e) { say(t); }
  });
  document.addEventListener('click', function (e) { if (active && !fab.contains(e.target) && !panel.contains(e.target) && !bar.contains(e.target)) { /* страница не блокируется — можно ходить по ссылкам и смотреть схему */ } }, true);
  window.addEventListener('resize', function () { if (active) document.body.style.paddingBottom = (panel.offsetHeight + 12) + 'px'; });

  ORIG[theme()] = readVars();
  apply();
})();
