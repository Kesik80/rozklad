/* COLORLAB v2 — мобільний підбір кольору (як console.js, але для кольорів).
   Вмикання: Info → «Підбір кольору» (або ?colorlab=1 / ?colorlab=0 в адресі).
   1) 🎨 → торкнись слова або фону (посилання не спрацьовують).
   2) «Підказки» самі підбирають кольори з палітри Radix, що гармонують з тлом (для тексту)
      або з кольором тексту (для фону); показано лише ті, де контраст достатній.
   3) Або обери родину Radix (brown, orange…) і крок 1–12 (1–2 тло, 3–5 елементи, 9 акцент, 11–12 текст).
   4) Бігунки — точне підлаштування. Усе — це ПОПЕРЕДНІЙ перегляд.
   5) «✓ Залишити» — зберегти правку в списку; незафіксована правка скасовується,
      коли торкаєшся іншого елемента. Світла і темна теми ведуться окремо (🌓).
   6) «Копіювати» — звіт зі всіма зафіксованими правками (для мене → app.css). */
(function () {
  'use strict';
  var KEY = 'colorlab';
  try { var q = /[?&]colorlab=([01])/.exec(location.search); if (q) localStorage.setItem(KEY, q[1]); } catch (e) {}
  var enabled = false;
  try { enabled = localStorage.getItem(KEY) === '1'; } catch (e) {}
  window.ColorLab = { enabled: function () { return enabled; }, set: function (v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} } };
  if (!enabled) return;

  var RDX={"gray":["fcfcfcf9f9f9f0f0f0e8e8e8e0e0e0d9d9d9cececebbbbbb8d8d8d838383646464202020","1111111919192222222a2a2a3131313a3a3a4848486060606e6e6e7b7b7bb4b4b4eeeeee"],"mauve":["fdfcfdfaf9fbf2eff3eae7ece3dfe6dbd8e0d0cdd7bcbac78e8c9984828e65636d211f26","1211131a191b2322252b292d3230353c393f49474e625f696f6d787c7a85b5b2bceeeef0"],"slate":["fcfcfdf9f9fbf0f0f3e8e8ece0e1e6d9d9e0cdced6b9bbc68b8d9880838d60646c1c2024","11111318191b212225272a2d2e3135363a3f43484e5a6169696e77777b84b0b4baedeef0"],"sage":["fbfdfcf7f9f8eef1f0e6e9e8dfe2e0d7dad9cbcfcdb8bcba868e8b7c84815f65631a211e","101211171918202221272a292e3130373b394449475b625f63706b717d79adb5b2eceeed"],"olive":["fcfdfcf8faf8eff1efe7e9e7dfe2dfd7dad7cccfccb9bcb8898e877f847d60655f1d211c","111210181917212220282a272f312e383a364548435c625b687066767d74afb5adeceeec"],"sand":["fdfdfcf9f9f8f1f0efe9e8e6e2e1dedad9d6cfcecabcbbb58d8d8682827c63635e21201c","1111101919182222212a2a2831312e3b3a3749484462605b6f6d667c7b74b5b3adeeeeec"],"tomato":["fffcfcfff8f7feebe7ffdcd3ffcdc2fdbdaff5a898ec8e7be54d2edd4425d134155c271f","1811111f15133917144e15115e1c166e2920853a2dac4d39e54d2eec6142ff977dfbd3cb"],"red":["fffcfcfff7f7feebecffdbdcffcdcefdbdbef4a9aaeb8e90e5484ddc3e42ce2c31641723","1911112013143b1219500f1c61162372232d8c333ab54548e5484dec5d5eff9592ffd1d9"],"ruby":["fffcfdfff7f8feeaedffdce1ffced6f8bfc8efacb8e592a3e54666dc3b5dca244d64172b","1911131e15173a141e4e13255e1a2e6f2539883447b3445ae54666ec5a72ff949dfed2e1"],"crimson":["fffcfdfef7f9ffe9f0fedce7faceddf3bed1eaacc3e093b2e93d82df3478cb1d63621639","1911142013183815254d122f5c18396d2545873356b0436ee93d82ee518aff92adfdd3e8"],"pink":["fffcfefef7fbfee9f5fbdceff6cee7efbfdde7acd0dd93c2d6409fcf3897c2298a651249","19111721121d37172f4b143d591c47692955833869a84885d6409fde51a8ff8dccfdd1ea"],"plum":["fefcfffdf7fdfbebfbf7def8f2d1f3e9c2ecdeade3cf91d8ab4abaa144af953ea353195d","181118201320351a35451d475124545e306173407992549cab4abab658c4e796f3f4d4f4"],"purple":["fefcfefbf7fef7edfef2e2fcead5f9e0c4f4d1afecbe93e48e4ec68347b98145b5402060","18111b1e1523301c3b3d224e48295c54346b6642828457aa8e4ec69a5cd0d19dffecd9fa"],"violet":["fdfcfefaf8fff4f0feebe4ffe1d9ffd4cafec2b5f5aa99ec6e56cf654dc46550b92f265f","14121f1b1525291f4333255b3c2e6947387656468b6958ad6e56cf7d66d9baa7ffe2ddfe"],"iris":["fdfdfff8f8fff0f1fee6e7ffdadcffcbcdffb8baf89b9ef05b5bd65151cd5753c6272962","13131e171625202248262a653033743d3e824a4a955958b15b5bd66e6adeb1a9ffe0dffe"],"indigo":["fdfdfef7f9ffedf2fee1e9ffd2deffc1d0ffabbdf98da4ef3e63dd3358d43a5bc71f2d5c","11131f1417261824491d2e622539743043843a4f97435db13e63dd5472e49eb1ffd6e1ff"],"blue":["fbfdfff4faffe6f4fed5efffc2e5ffacd8fc8ec8f65eb1ef0090ff0588f00d74ce113264","0d15201119270d2847003362004074104d87205d9e2870bd0090ff3b9eff70b8ffc2e6ff"],"cyan":["fafdfef2fafbdef7f9caf1f6b5e9f09ddde77dcedc3db9cf00a2c70797b9107d980d3c48","0b161a101b20082c3600384800455804546812677e11809c00a2c723afd04ccce6b6ecf7"],"teal":["fafefdf3fbf9e0f8f3ccf3eab8eae0a1ded283cdc153b9ab12a5940d9b8a0085730d3d38","0d1514111c1b0d2d2a023b370848431457501c6961207e7312a5940eb39e0bd8b6adf0dd"],"jade":["fbfefdf4fbf7e6f7edd6f1e3c3e9d7acdec88bceb656ba9f29a38326997b2083681d3b31","0d1512121c180f2e220b3b2c1148371b57452468542a7e6829a38327b08b1fd8a4adf0d4"],"green":["fbfefcf4fbf6e6f6ebd6f1dfc4e8d1adddc08eceaa5bb98b30a46c2b9a66218358193b2d","0e1512121b17132d21113b2917493320573e28684a2f7c5730a46c33b0743dd68cb1f1cb"],"grass":["fbfefbf5fbf5e9f6e9daf1dbc9e8cab2ddb594ce9a65ba7446a7583e9b4f2a7e3b203c25","0e1511141a151b2a1e1d3a2425482d2d57363667403e794946a75853b36571d083c2f0c2"],"bronze":["fdfcfcfdf7f5f6edeaefe4dfe7d9d3dfcdc5d3bcb3c2a499a180729574687d5e5443302b","1411101c1917262220302a273b3330493e3a5a4c476f5f58a18072ae8c7ed4b3a5ede0d9"],"gold":["fdfdfcfaf9f2f2f0e7eae6dbe1dccfd8d0bfcbc0aab9a88d9783658c7a5e71624b3b352b","1212111b1a1724231f2d2b2638352e444039544f46696256978365a39073cbb99fe8e2d9"],"brown":["fefdfcfcf9f6f6eee7f0e4d9ebdacae4cdb7dcbc9fcea37ead7f58a07553815e463e332e","12110f1c181628211d3229223e31284d3c2f614a397c5f46ad7f58b88c67dbb594f2e1ca"],"orange":["fefcfbfff7edffefd6ffdfb5ffd19affc182f5ae73ec9455f76b15ef5f00cc4e00582d1d","17120e1e160f331e0b46210056280066350c7e451da35829f76b15ff801fffa057ffe0c2"],"amber":["fefdfbfefbe9fff7c2ffee9cfbe577f3d673e9c162e2a336ffc53dffba18ab64004f3422","16120c1d180f3020083f27004d30005c3d05714f198f6424ffc53dffd60affca16ffe7b3"],"yellow":["fdfdf9fefce9fffab8fff394ffe770f3d768e4c767d5ae39ffe629ffdc009e6c00473b1f","14120b1b180f2d2305362b00433500524202665417836a21ffe629ffff57f5e147f6eeb4"],"lime":["fcfdfaf8faf3eef6d6e2f0bdd3e7a6c2da91abc9788db654bdee63b0e64c5c7c2f37401c","11130c151a101f291729371d3344233d522a496231577538bdee63d4ff70bde56ce3f7ba"],"mint":["f9fefdf2fbf9ddf9f2c8f4e9b3ecde9ce0d07ecfbd4cbba586ead47de0cb02786416433c","0e15150f1b1b092c2b003a380047441056501e685f277f7086ead4a8f5e558d5bac4f5e1"],"sky":["f9fefff1fafde1f6fdd1f0fabee7f5a9daed8dcae360b3d77ce2fe74daf800749e1d3e56","0d141f111a271128401135551544671b537b1f6692197cae7ce2fea8eeff75c7f0c2f3ff"]};

  var VARS = ['--bg-0', '--bg-1', '--bg-2', '--label', '--label-2', '--label-3', '--separator', '--accent', '--next', '--th', '--hint', '--red', '--wd', '--ok', '--th-bg', '--key'];
  var ORDER = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand', 'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'sky', 'cyan', 'teal', 'jade', 'mint', 'green', 'grass', 'lime', 'yellow', 'amber', 'orange', 'brown', 'bronze', 'gold'];
  var ACC = ['red', 'orange', 'amber', 'yellow', 'green', 'teal', 'cyan', 'blue', 'violet', 'pink'];

  /* ---------- кольорові утиліти ---------- */
  function parse(c) {
    if (!c) return [0, 0, 0, 0];
    var m = /rgba?\(([^)]+)\)/.exec(c);
    if (m) { var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    m = /color\(srgb\s+([^)]+)\)/.exec(c);
    if (m) { var q = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat); return [q[0] * 255, q[1] * 255, q[2] * 255, q.length > 3 ? q[3] : 1]; }
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
  function bgOf(el) {
    var stack = [], n = el;
    while (n && n.nodeType === 1) { var c = parse(getComputedStyle(n).backgroundColor); if (c[3] > 0) stack.push(c); if (c[3] >= .999) break; n = n.parentElement; }
    var res = theme() ? [11, 15, 23, 1] : [255, 255, 255, 1];
    for (var i = stack.length - 1; i >= 0; i--) res = blend(stack[i], res);
    return res;
  }
  function varName(c) {
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
  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0; }
  function themeName() { return theme() ? 'dark' : 'light'; }

  /* ---------- палітра Radix ---------- */
  var FAM = {};
  ORDER.forEach(function (f) {
    var h9 = fromHex(RDX[f][0].substr(48, 6)), h = rgb2hsl(h9[0], h9[1], h9[2]);
    FAM[f] = { h: h[0], s: h[1], neutral: h[1] < 14 };
  });
  function step(f, n) { return '#' + RDX[f][theme()].substr((n - 1) * 6, 6); }
  function hdist(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
  function familyOf(rgb) {
    var h = rgb2hsl(rgb[0], rgb[1], rgb[2]);
    if (h[1] < 12) return 'gray';
    var best = 'gray', bd = 999;
    ORDER.forEach(function (f) { if (FAM[f].neutral) return; var d = hdist(h[0], FAM[f].h); if (d < bd) { bd = d; best = f; } });
    return best;
  }
  function byHue(list, f) { var h = FAM[f].h; return list.slice().sort(function (a, b) { return hdist(FAM[a].h, h) - hdist(FAM[b].h, h); }); }

  /* ---------- інтерфейс ---------- */
  var ui = {}, active = false, sel = null, tab = 'text', all = false, hsl = [0, 0, 50], orig = null, outlined = null;
  var cur = null, committed = [], fam = null, note = '';
  var css = document.createElement('style');
  css.textContent =
    '#cl-fab{position:fixed;right:12px;bottom:12px;z-index:2147483001;width:46px;height:46px;border-radius:50%;border:2px solid #fff;background:#222;color:#fff;font-size:22px;line-height:1;box-shadow:0 2px 10px rgba(0,0,0,.5);padding:0}' +
    '#cl-fab.on{background:#d6249f}' +
    '#cl-panel{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#15171c;color:#eef0f4;font:13px/1.35 -apple-system,Roboto,sans-serif;padding:10px 12px 64px;border-top:2px solid #d6249f;max-height:62vh;overflow:auto;display:none}' +
    '#cl-panel *{box-sizing:border-box;font-family:inherit}' +
    '#cl-panel .r{display:flex;align-items:center;gap:8px;margin:6px 0}' +
    '#cl-panel .sw{width:46px;height:46px;border-radius:10px;border:1px solid #555;flex:none}' +
    '#cl-panel .t{flex:1;min-width:0}' +
    '#cl-panel .t b{font-size:15px}' +
    '#cl-panel .sm{opacity:.7;font-size:12px;word-break:break-all}' +
    '#cl-panel .h{font-size:12px;opacity:.85;margin:8px 0 3px;font-weight:600}' +
    '#cl-panel button{background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:7px 10px;font-size:13px}' +
    '#cl-panel button.on{background:#d6249f;border-color:#d6249f}' +
    '#cl-panel button.ok2{background:#238636;border-color:#2ea043}' +
    '#cl-panel input[type=text]{background:#0e1014;color:#fff;border:1px solid #3a4150;border-radius:8px;padding:6px 8px;width:92px;font-size:14px}' +
    '#cl-panel input[type=range]{flex:1;min-width:0;height:26px;-webkit-appearance:none;appearance:none;border-radius:13px;border:1px solid #444}' +
    '#cl-panel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:2px solid #d6249f}' +
    '#cl-panel label.lb{width:78px;flex:none;font-size:12px;opacity:.85}' +
    '#cl-panel .zone{height:7px;border-radius:4px;margin:-2px 0 4px 86px;display:flex;overflow:hidden}' +
    '#cl-panel .zone i{flex:1}' +
    '#cl-panel .fams{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px}' +
    '#cl-panel .fams button{flex:none;padding:5px 8px;font-size:12px;display:flex;align-items:center;gap:5px}' +
    '#cl-panel .fams button i{width:11px;height:11px;border-radius:50%;display:inline-block}' +
    '#cl-panel .sg{display:flex;flex-wrap:wrap;gap:5px}' +
    '#cl-panel .sg button{padding:0;width:50px;height:40px;border-radius:8px;border:1px solid #555;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;font-size:15px;font-weight:700}' +
    '#cl-panel .sg button small{font-size:9px;font-weight:400;opacity:.85}' +
    '#cl-panel .sg button.dim{opacity:.3}' +
    '#cl-panel .cm{display:flex;align-items:center;gap:6px;margin:3px 0;font-size:12px}' +
    '#cl-panel .cm span{flex:1;min-width:0;word-break:break-all}' +
    '#cl-panel .cm i{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #666;vertical-align:-2px}' +
    '#cl-panel .bad{color:#ff7b72}#cl-panel .ok{color:#56d364}#cl-panel .mid{color:#e3b341}' +
    '#cl-bar{position:fixed;left:0;right:64px;bottom:0;z-index:2147483000;background:#15171c;padding:8px 0 10px 12px;display:none;gap:6px;flex-wrap:nowrap}' +
    '#cl-bar button{background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:9px 10px;font-size:13px;white-space:nowrap}' +
    '#cl-bar button.on{background:#d6249f;border-color:#d6249f}#cl-bar button.ok2{background:#238636;border-color:#2ea043;font-weight:700}';
  document.head.appendChild(css);

  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function $(id) { return document.getElementById(id); }

  ui.fab = el('button', { id: 'cl-fab', type: 'button', 'aria-label': 'Підбір кольору' }, '🎨');
  ui.panel = el('div', { id: 'cl-panel' });
  ui.bar = el('div', { id: 'cl-bar' });
  ui.panel.innerHTML =
    '<div class="r"><div class="sw" id="cl-sw"></div><div class="t"><b id="cl-name">Торкнись слова або фону</b><div class="sm" id="cl-info"></div></div><button id="cl-theme" type="button" style="flex:none;font-size:20px;padding:8px 12px" aria-label="Тема">🌓</button></div>' +
    '<div class="r"><button id="cl-tt" class="on" type="button">Текст</button><button id="cl-tb" type="button">Фон</button>' +
    '<span id="cl-ratio" class="sm"></span></div>' +
    '<div class="h">Підібрано під ' + '<span id="cl-sgh"></span></div><div id="cl-sug"></div>' +
    '<div class="r"><button id="cl-adv-b" type="button">⚙ Точно ▾</button></div>' +
    '<div id="cl-adv" style="display:none"><div class="r"><label class="lb">HEX</label><input id="cl-hex" type="text" maxlength="7" value="#" aria-label="HEX"></div>' +
    '<div class="h">Палітра Radix — родина</div><div class="fams" id="cl-fams"></div>' +
    '<div class="sg" id="cl-steps"></div>' +
    '<div class="h">Точно</div>' +
    '<div class="r"><label class="lb">Тон</label><input id="cl-h" type="range" min="0" max="360" step="1"></div>' +
    '<div class="r"><label class="lb">Насиченість</label><input id="cl-s" type="range" min="0" max="100" step="1"></div>' +
    '<div class="r"><label class="lb">Яскравість</label><input id="cl-l" type="range" min="0" max="100" step="1"></div>' +
    '<div class="zone" id="cl-zone"></div>' +
    '<div class="h">Залишені правки</div><div id="cl-list" class="sm">—</div>' +
    '</div><div class="sm" id="cl-log" style="white-space:pre-wrap;margin-top:6px"></div>';
  ui.bar.innerHTML = '<button id="cl-fix" class="ok2" type="button">✓ Залишити</button><button id="cl-reset" type="button">↶ Скасувати</button><button id="cl-all" type="button">Усі такі: ні</button><button id="cl-copy" type="button">Копіювати</button><button id="cl-close" type="button">✕</button>';
  document.body.appendChild(ui.fab); document.body.appendChild(ui.panel); document.body.appendChild(ui.bar);
  ['sw', 'name', 'info', 'theme', 'tt', 'tb', 'hex', 'ratio', 'sgh', 'sug', 'fams', 'steps', 'h', 's', 'l', 'zone', 'list', 'log', 'adv', 'adv-b', 'fix', 'reset', 'all', 'copy', 'close'].forEach(function (k) { ui[k] = $('cl-' + k); });
  ORDER.forEach(function (f) {
    var b = el('button', { type: 'button' }, '<i style="background:' + '#' + RDX[f][0].substr(48, 6) + '"></i>' + f);
    b.addEventListener('click', function () { fam = fam === f ? null : f; renderFams(); renderSteps(); });
    b.__f = f; ui.fams.appendChild(b);
  });

  /* ---------- вибір елемента ---------- */
  function inUi(t) { return t === ui.fab || ui.panel.contains(t) || ui.bar.contains(t); }
  function clearOutline() { if (outlined) { outlined.el.style.outline = outlined.o; outlined.el.style.outlineOffset = outlined.f; outlined = null; } }
  function select(t) {
    if (t !== sel && cur) { revertPreview(); say('Непідтверджену правку скасовано'); }
    clearOutline();
    sel = t;
    outlined = { el: t, o: t.style.outline, f: t.style.outlineOffset };
    t.style.outline = '2px dashed #d6249f'; t.style.outlineOffset = '1px';
    note = ''; load();
  }
  function prop() { return tab === 'text' ? 'color' : 'background-color'; }
  function curColor() { if (!sel) return [0, 0, 0, 1]; return tab === 'text' ? parse(getComputedStyle(sel).color) : bgOf(sel); }
  function load() {
    var c = curColor(), p = prop();
    var o = cur && cur.orig[p];
    orig = { rgb: o ? o : c.slice(0, 3), prop: p, el: sel };
    var h = rgb2hsl(c[0], c[1], c[2]); hsl = [h[0], h[1], h[2]];
    refreshSliders(); update(false);
  }
  function refreshSliders() { ui.h.value = Math.round(hsl[0]); ui.s.value = Math.round(hsl[1]); ui.l.value = Math.round(hsl[2]); }
  function otherColor() { if (!sel) return [255, 255, 255]; return tab === 'text' ? bgOf(sel) : parse(getComputedStyle(sel).color); }
  function say(t) { ui.log.textContent = t; }

  function paintTracks() {
    var s = hsl[1], l = hsl[2], h = hsl[0], i, st = [];
    for (i = 0; i <= 12; i++) { var r = hsl2rgb(i * 30, s, l); st.push(hex(r[0], r[1], r[2])); }
    ui.h.style.background = 'linear-gradient(90deg,' + st.join(',') + ')';
    var a = hsl2rgb(h, 0, l), b = hsl2rgb(h, 100, l);
    ui.s.style.background = 'linear-gradient(90deg,' + hex(a[0], a[1], a[2]) + ',' + hex(b[0], b[1], b[2]) + ')';
    st = []; for (i = 0; i <= 10; i++) { var rr = hsl2rgb(h, s, i * 10); st.push(hex(rr[0], rr[1], rr[2])); }
    ui.l.style.background = 'linear-gradient(90deg,' + st.join(',') + ')';
    var oc = otherColor(), z = '';
    for (i = 0; i < 40; i++) { var qq = hsl2rgb(h, s, i * 100 / 39), cr = ratio(qq, oc); z += '<i style="background:' + (cr >= 4.5 ? '#2ea043' : cr >= 3 ? '#d29922' : '#8b2b2b') + '"></i>'; }
    ui.zone.innerHTML = z;
  }
  function update(write) {
    var rgb = hsl2rgb(hsl[0], hsl[1], hsl[2]), hx = hex(rgb[0], rgb[1], rgb[2]);
    ui.sw.style.background = hx; ui.hex.value = hx;
    var oc = otherColor(), cr = ratio(rgb, oc), cls = cr >= 4.5 ? 'ok' : cr >= 3 ? 'mid' : 'bad';
    ui.ratio.innerHTML = 'контраст ' + (tab === 'text' ? 'з тлом ' : 'з текстом ') + '<b class="' + cls + '">' + cr.toFixed(1) + ':1</b> ' + (cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'лише великий' : 'погано');
    if (sel && orig) {
      var vs = varName(orig.rgb.concat([1]));
      ui.name.textContent = describe(sel) + (sel.children.length ? '' : ' — «' + (sel.textContent || '').trim().slice(0, 24) + '»');
      ui.info.textContent = 'було ' + hex(orig.rgb[0], orig.rgb[1], orig.rgb[2]) + (vs.length ? ' = ' + vs.join(' / ') : '') + ' · тема: ' + themeName() + (cur ? ' · не залишено' : '');
    }
    paintTracks(); renderSuggest(); renderSteps(); renderList();
    ui.fix.classList.toggle('on', !!cur);
    if (write) paint(hx);
  }

  /* ---------- підказки ---------- */
  function swatchBtn(hx, name, oc) {
    var b = el('button', { type: 'button', title: name }), cr = ratio(fromHex(hx), oc);
    if (tab === 'text') { b.style.background = hex(oc[0], oc[1], oc[2]); b.style.color = hx; } else { b.style.background = hx; b.style.color = hex(oc[0], oc[1], oc[2]); }
    b.innerHTML = 'Аа<small>' + name + ' · ' + cr.toFixed(1) + '</small>';
    if (cr < 3) b.className = 'dim';
    b.addEventListener('click', function () { chooseHex(hx, name); });
    return b;
  }
  function renderSuggest() {
    ui.sug.innerHTML = '';
    if (!sel) { ui.sgh.textContent = ''; return; }
    var oc = otherColor(), base = familyOf(oc), groups = [], seen = {};
    function add(g, f, n, min) {
      var hx = step(f, n), key = hx; if (seen[key] || ratio(fromHex(hx), oc) < min) return; seen[key] = 1; g.items.push([hx, f + '-' + n]);
    }
    if (tab === 'text') {
      ui.sgh.textContent = 'фон ' + hex(oc[0], oc[1], oc[2]);
      var g1 = { t: 'Тон у тон', items: [] }; add(g1, base, 12, 4.5); add(g1, base, 11, 4.5); add(g1, base, 10, 4.5); add(g1, base, 9, 3);
      var g2 = { t: 'Нейтральні', items: [] }; ['gray', 'slate', 'mauve', 'sand'].forEach(function (f) { add(g2, f, 12, 4.5); add(g2, f, 11, 4.5); });
      var g3 = { t: 'Акценти (близькі → контрастні)', items: [] };
      byHue(ACC, base).forEach(function (f) { if (f !== base) { add(g3, f, 11, 4.5); add(g3, f, 9, 3); } });
      groups = [g1, g2, g3];
    } else {
      var tf = familyOf(oc); ui.sgh.textContent = 'текст ' + hex(oc[0], oc[1], oc[2]);
      var gA = { t: 'Тон у тон з текстом', items: [] }; [1, 2, 3, 4].forEach(function (n) { add(gA, tf, n, 4.5); }); add(gA, tf, 9, 3);
      var gB = { t: 'Нейтральні', items: [] }; ['gray', 'slate', 'mauve', 'sand'].forEach(function (f) { [1, 2, 3].forEach(function (n) { add(gB, f, n, 4.5); }); });
      var gC = { t: 'Кольорові', items: [] }; byHue(ACC, tf).forEach(function (f) { if (f !== tf) { [2, 3].forEach(function (n) { add(gC, f, n, 4.5); }); add(gC, f, 9, 3); } });
      groups = [gA, gB, gC];
    }
    var caps = [3, 2, 3], flat = [];
    groups.forEach(function (g, i) { g.items.slice(0, caps[i]).forEach(function (it) { flat.push(it); }); });
    if (flat.length) { var w = el('div', { class: 'sg' }); flat.forEach(function (it) { w.appendChild(swatchBtn(it[0], it[1], oc)); }); ui.sug.appendChild(w); }
    if (!ui.sug.children.length) ui.sug.innerHTML = '<div class="sm">Немає варіантів із достатнім контрастом — обери вручну.</div>';
  }
  function renderFams() { Array.prototype.forEach.call(ui.fams.children, function (b) { b.classList.toggle('on', b.__f === fam); }); }
  function renderSteps() {
    ui.steps.innerHTML = '';
    if (!fam || !sel) return;
    var oc = otherColor();
    for (var n = 1; n <= 12; n++) ui.steps.appendChild(swatchBtn(step(fam, n), fam + '-' + n, oc));
  }
  function chooseHex(hx, name) {
    if (!sel) return;
    var c = fromHex(hx), h = rgb2hsl(c[0], c[1], c[2]); hsl = [h[0], h[1], h[2]]; note = name || ''; refreshSliders(); applyHsl(hx);
  }

  /* ---------- перегляд / фіксація ---------- */
  function targets() {
    var p = orig.prop;
    cur.t = cur.t || {};
    if (cur.t[p] && cur.tAll === all) return cur.t[p];
    var out = [sel];
    if (all) {
      var key = orig.rgb.map(Math.round).join(','), list = document.body.querySelectorAll('*');
      for (var i = 0; i < list.length; i++) {
        var n = list[i]; if (inUi(n) || n === sel) continue;
        var cs = getComputedStyle(n), c = p === 'color' ? parse(cs.color) : parse(cs.backgroundColor);
        if (c[3] > 0 && c.slice(0, 3).map(Math.round).join(',') === key) out.push(n);
      }
    }
    cur.t[p] = out; cur.tAll = all; return out;
  }
  function paint(hx) {
    var p = orig.prop;
    if (!cur) cur = { saved: [], entries: {}, orig: {}, t: {}, tAll: all, theme: themeName() };
    if (!cur.orig[p]) cur.orig[p] = orig.rgb.slice();
    var list = targets();
    list.forEach(function (n) {
      var mk = '__cl_' + p;
      if (n[mk] !== cur) { cur.saved.push({ n: n, p: p, old: n.style.getPropertyValue(p), pr: n.style.getPropertyPriority(p) }); n[mk] = cur; }
      n.style.setProperty(p, hx, 'important');
    });
    var e = cur.entries[p];
    if (!e) e = cur.entries[p] = { el: describe(sel), text: (sel.textContent || '').trim().slice(0, 24), prop: p === 'color' ? 'текст' : 'фон', from: hex(orig.rgb[0], orig.rgb[1], orig.rgb[2]), vars: varName(orig.rgb.concat([1])), theme: themeName() };
    e.to = hx; e.n = list.length; e.all = all; e.note = note;
    say('Перегляд: ' + e.prop + ' ' + e.from + ' → ' + hx + (list.length > 1 ? ' (' + list.length + ' ел.)' : '') + '\nНатисни «✓ Залишити», щоб залишити.');
    ui.fix.classList.add('on'); ui.info.textContent = ui.info.textContent.replace(/ · не залишено$/, '') + ' · не залишено';
    paintTracks(); renderSuggest(); renderSteps();
  }
  function applyHsl(forceHex) {
    var rgb = hsl2rgb(hsl[0], hsl[1], hsl[2]), hx = forceHex || hex(rgb[0], rgb[1], rgb[2]);
    ui.sw.style.background = hx; ui.hex.value = hx;
    var oc = otherColor(), cr = ratio(fromHex(hx), oc), cls = cr >= 4.5 ? 'ok' : cr >= 3 ? 'mid' : 'bad';
    ui.ratio.innerHTML = 'контраст ' + (tab === 'text' ? 'з тлом ' : 'з текстом ') + '<b class="' + cls + '">' + cr.toFixed(1) + ':1</b> ' + (cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'лише великий' : 'погано');
    paint(hx);
  }
  function revertPreview() {
    if (!cur) return;
    for (var i = cur.saved.length - 1; i >= 0; i--) { var s = cur.saved[i]; if (s.old) s.n.style.setProperty(s.p, s.old, s.pr); else s.n.style.removeProperty(s.p); delete s.n['__cl_' + s.p]; }
    cur = null; ui.fix.classList.remove('on');
  }
  function commit() {
    if (!cur || !cur.saved.length) { say('Немає що фіксувати'); return; }
    cur.saved.forEach(function (s) { s.neu = s.n.style.getPropertyValue(s.p); delete s.n['__cl_' + s.p]; });
    Object.keys(cur.entries).forEach(function (k) { committed.push({ e: cur.entries[k], saved: cur.saved.filter(function (s) { return s.p === k; }), active: true }); });
    cur = null; say('✓ Залишено'); if (sel) { load(); }
  }
  function undoCommitted(i) {
    var c = committed[i]; if (!c) return;
    if (c.active) c.saved.slice().reverse().forEach(function (s) { if (s.old) s.n.style.setProperty(s.p, s.old, s.pr); else s.n.style.removeProperty(s.p); });
    committed.splice(i, 1); if (sel) load(); else renderList();
  }
  function resetPreview() { if (!cur) { say('Немає непідтвердженої правки'); return; } revertPreview(); say('Правку скасовано'); if (sel) load(); }
  function renderList() {
    if (!committed.length) { ui.list.textContent = '— поки нічого'; return; }
    ui.list.innerHTML = '';
    committed.forEach(function (c, i) {
      var e = c.e, row = el('div', { class: 'cm', style: c.active ? '' : 'opacity:.45' });
      row.innerHTML = '<span>' + e.theme + ' · ' + e.el + (e.text ? ' «' + e.text + '»' : '') + ' [' + e.prop + '] <i style="background:' + e.from + '"></i>→<i style="background:' + e.to + '"></i> ' + e.to + (e.note ? ' (' + e.note + ')' : '') + (e.all ? ' ×' + e.n : '') + '</span>';
      var b = el('button', { type: 'button' }, '✕'); b.addEventListener('click', function () { undoCommitted(i); }); row.appendChild(b); ui.list.appendChild(row);
    });
  }
  function summary() {
    var pg = document.body.getAttribute('data-page') || location.pathname, lines = ['Сторінка: ' + pg];
    committed.forEach(function (c) { var e = c.e; lines.push('• [' + e.theme + '] ' + e.el + (e.text ? ' «' + e.text + '»' : '') + ' [' + e.prop + ']: ' + e.from + (e.vars.length ? ' (' + e.vars.join('/') + ')' : '') + ' → ' + e.to + (e.note ? ' · ' + e.note : '') + (e.all ? ' · усі такі самі (' + e.n + ' ел.)' : '')); });
    if (cur) lines.push('(є непідтверджена правка — не включено)');
    return lines.join('\n');
  }
  function switchTheme() {
    var from = themeName(), nx = from === 'dark' ? 'light' : 'dark';
    if (cur) { revertPreview(); }
    committed.forEach(function (c) { if (c.e.theme === from && c.active) { c.saved.slice().reverse().forEach(function (s) { if (s.old) s.n.style.setProperty(s.p, s.old, s.pr); else s.n.style.removeProperty(s.p); }); c.active = false; } });
    try { localStorage.setItem('theme', nx); } catch (e) {}
    if (window.Rozklad && Rozklad.applyTheme) Rozklad.applyTheme(nx); else document.documentElement.setAttribute('data-theme', nx);
    committed.forEach(function (c) { if (c.e.theme === nx && !c.active) { c.saved.forEach(function (s) { s.n.style.setProperty(s.p, s.neu, 'important'); }); c.active = true; } });
    say('Тема: ' + nx + ' (правки іншої теми ховаються, але лишаються в списку)');
    if (sel) load(); else renderList();
  }

  /* ---------- події ---------- */
  function setActive(v) {
    active = v; ui.fab.classList.toggle('on', v); ui.panel.style.display = v ? 'block' : 'none'; ui.bar.style.display = v ? 'flex' : 'none';
    document.body.style.paddingBottom = v ? (ui.panel.offsetHeight + 12) + 'px' : '';
    if (!v) clearOutline();
  }
  ui.fab.addEventListener('click', function (e) { e.stopPropagation(); setActive(!active); });
  ui.close.addEventListener('click', function () { setActive(false); });
  document.addEventListener('click', function (e) {
    if (!active || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    select(e.target);
  }, true);
  ui.tt.addEventListener('click', function () { tab = 'text'; ui.tt.classList.add('on'); ui.tb.classList.remove('on'); note = ''; if (sel) load(); });
  ui.tb.addEventListener('click', function () { tab = 'bg'; ui.tb.classList.add('on'); ui.tt.classList.remove('on'); note = ''; if (sel) load(); });
  ['h', 's', 'l'].forEach(function (k, i) { ui[k].addEventListener('input', function () { if (!sel) return; hsl[i] = parseFloat(ui[k].value); note = ''; applyHsl(); paintTracks(); }); });
  ui.hex.addEventListener('change', function () {
    var c = fromHex(ui.hex.value.trim()); if (!c || !sel) return;
    var h = rgb2hsl(c[0], c[1], c[2]); hsl = [h[0], h[1], h[2]]; note = ''; refreshSliders(); applyHsl(hex(c[0], c[1], c[2]));
  });
  ui.all.addEventListener('click', function () {
    all = !all; ui.all.textContent = 'Усі такі: ' + (all ? 'так' : 'ні'); ui.all.classList.toggle('on', all);
    if (cur) { revertPreview(); say('Режим змінено — перегляд скинуто'); if (sel) load(); }
  });
  ui['adv-b'].addEventListener('click', function () { var o = ui.adv.style.display === 'none'; ui.adv.style.display = o ? 'block' : 'none'; ui['adv-b'].textContent = o ? '⚙ Точно ▴' : '⚙ Точно ▾'; });
  ui.fix.addEventListener('click', commit);
  ui.reset.addEventListener('click', resetPreview);
  ui.theme.addEventListener('click', switchTheme);
  ui.copy.addEventListener('click', function () {
    var t = summary(), done = function () { say('Скопійовано:\n' + t); };
    try { navigator.clipboard.writeText(t).then(done, function () { say(t); }); } catch (e) { say(t); }
  });
  window.addEventListener('resize', function () { if (active) document.body.style.paddingBottom = (ui.panel.offsetHeight + 12) + 'px'; });
  renderFams(); renderList();
})();
