/* COLORLAB v9 — «комбайн» подбора цвета (мобильный, для всех страниц сразу).
   Включение: Info → «Подбор цвета» (или ?colorlab=1 / ?colorlab=0 в адресе).
   Три вкладки:
   👆 Элемент — тапни слово / иконку / фон: видно цвет, контраст AA/AAA и «Где применить»:
        • «Все такие же» (по классу) • «Такие же внутри родителя» • «Только этот» • «Роль» (переменная темы).
      Подсказки подбираются по фону и по соседним цветам, плюс палитра Radix. Правило сохраняется для ВСЕХ страниц.
   🎨 Схема — вся тема из одного цвета (Material You / Radix) для обеих тем + ручные роли + замки 🔒.
   📋 Правила — список правил элемента: 🔒 защита, 👁 выкл/вкл, ✕ удалить.
   «Копировать CSS» — готовый код (переменные + правила) для app.css. */
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
    { id: 'key', name: 'Заголовок страницы, Терешки, выделенные времена', vars: ['--key'] },
    { id: 'next', name: 'Ближайший рейс, ссылки', vars: ['--next'] },
    { id: 'th', name: 'Скоро рейс, цены', vars: ['--th'] },
    { id: 'red', name: 'Предупреждение, рейс сейчас', vars: ['--red'] },
    { id: 'wd', name: 'Рейс только Пн–Пт', vars: ['--wd'] },
    { id: 'ok', name: 'Зелёный текст', vars: ['--ok'] },
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
  var P = { light: {}, dark: {}, seed: null, rules: [] };
  try { var sv = JSON.parse(localStorage.getItem(PKEY) || 'null'); if (sv && sv.light && sv.dark) P = sv; P.rules = P.rules || []; } catch (e) {}
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
    var card, text, text2, line, plate, key, next, th, red, wd, ok;
    if (auto) {
      if (fam && RDX[fam]) { card = step(fam, 2); text = step(fam, 12); text2 = step(fam, 11); line = step(fam, d ? 5 : 6); }
      else {
        card = d ? hex.apply(null, fromHsl(hh[0], hh[1], Math.min(100, hh[2] + 4))) : (hh[2] > 92 ? '#ffffff' : hex.apply(null, fromHsl(hh[0], hh[1], Math.min(100, hh[2] + 4))));
        text = hex.apply(null, fromHsl(hh[0], Math.min(hh[1], 18), d ? 95 : 9));
        text2 = hex.apply(null, fromHsl(hh[0], Math.min(hh[1], 14), d ? 72 : 40));
        line = mix(card, text, .14);
      }
      if (S.over && S.over.card) card = S.over.card;
      if (S.over && S.over.text) text = S.over.text;
      text = fix(text, card, 7); text2 = fix(text2, card, 4.5);
      var base = function (id) { return S.accent ? accent : orole(id); };
      key = fix(base('key'), card, 4.5); next = fix(base('next'), card, 4.5); th = fix(base('th'), card, 4.5);
      red = fix(orole('red'), card, 4.5); wd = fix(orole('wd'), card, 4.5); ok = fix(orole('ok'), card, 4.5);
      plate = mix(card, accent, d ? .16 : .12);
    } else { card = orole('card'); text = orole('text'); text2 = orole('text2'); line = orole('line'); key = orole('key'); next = orole('next'); th = orole('th'); red = orole('red'); wd = orole('wd'); ok = orole('ok'); plate = orole('plate'); }
    out = { bg: bg, card: card, text: text, text2: text2, accent: accent, key: key, next: next, th: th, red: red, wd: wd, ok: ok, line: line, plate: plate };
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
  /* ---------- генераторы схем ---------- */
  function lab2hex(L, C, h) {          // CIE L*C*h → sRGB (если вне гаммы, уменьшаем хрому)
    function conv(Cc) {
      var a = Cc * Math.cos(h * Math.PI / 180), bb = Cc * Math.sin(h * Math.PI / 180), fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - bb / 200;
      var f = function (t) { return t * t * t > .008856 ? t * t * t : (t - 16 / 116) / 7.787; };
      var X = f(fx) * .95047, Y = L > 8 ? f(fy) : L / 903.3, Z = f(fz) * 1.08883;
      var lin = [3.2406 * X - 1.5372 * Y - .4986 * Z, -.9689 * X + 1.8758 * Y + .0415 * Z, .0557 * X - .2040 * Y + 1.0570 * Z];
      return lin;
    }
    for (var Cc = C; Cc >= 0; Cc -= 1) {
      var lin = conv(Cc), ok = lin.every(function (v) { return v >= -.0005 && v <= 1.0005; });
      if (ok || Cc < 1) return hex.apply(null, lin.map(function (v) { v = Math.max(0, Math.min(1, v)); return 255 * (v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055); }));
    }
  }
  function hex2lch(h) {
    var c = rgb(h).map(function (v) { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    var X = (.4124 * c[0] + .3576 * c[1] + .1805 * c[2]) / .95047, Y = .2126 * c[0] + .7152 * c[1] + .0722 * c[2], Z = (.0193 * c[0] + .1192 * c[1] + .9505 * c[2]) / 1.08883;
    var f = function (t) { return t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
    var L = 116 * f(Y) - 16, a = 500 * (f(X) - f(Y)), b = 200 * (f(Y) - f(Z));
    return [L, Math.sqrt(a * a + b * b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360];
  }
  function material(seed) {              // Material You: тональные палитры от одного цвета
    var lc = hex2lch(seed), h = lc[2], C = Math.max(40, Math.min(80, lc[1]));
    var pri = function (t) { return lab2hex(t, C, h); }, sec = function (t) { return lab2hex(t, 16, h); }, ter = function (t) { return lab2hex(t, 36, (h + 60) % 360); };
    var neu = function (t) { return lab2hex(t, 4, h); }, nv = function (t) { return lab2hex(t, 8, h); };
    var err = function (t) { return lab2hex(t, 75, 40); }, grn = function (t) { return lab2hex(t, 55, 140); }, cyn = function (t) { return lab2hex(t, 40, 205); };
    return {
      light: { bg: neu(98), card: neu(100), text: neu(10), text2: nv(30), accent: pri(48), key: pri(40), next: pri(40), th: ter(40), line: nv(80), plate: pri(92), red: err(45), wd: cyn(40), ok: grn(40) },
      dark: { bg: neu(7), card: neu(12), text: neu(92), text2: nv(80), accent: pri(80), key: pri(80), next: pri(80), th: ter(80), line: nv(30), plate: pri(24), red: err(80), wd: cyn(80), ok: grn(80) }
    };
  }
  var PAIR = { tomato: 'mauve', red: 'mauve', ruby: 'mauve', crimson: 'mauve', pink: 'mauve', plum: 'mauve', purple: 'mauve', violet: 'mauve', iris: 'slate', indigo: 'slate', blue: 'slate', sky: 'slate', cyan: 'slate', teal: 'sage', jade: 'sage', mint: 'sage', green: 'sage', grass: 'olive', lime: 'olive', yellow: 'sand', amber: 'sand', orange: 'sand', brown: 'sand', bronze: 'sand', gold: 'sand' };
  function radix(f) {                    // Radix Colors: шаги шкалы по ролям, нейтральная пара подбирается автоматически
    var n = NEUTRAL[f] ? f : (PAIR[f] || 'gray'), out = {};
    [0, 1].forEach(function (i) {
      var st = function (fam, k) { return '#' + RDX[fam][i].substr((k - 1) * 6, 6); };
      out[i ? 'dark' : 'light'] = { bg: st(n, 1), card: st(n, 2), text: st(n, 12), text2: st(n, 11), accent: st(f, 9), key: st(f, 11), next: st(f, 11), th: st('amber', 11), line: st(n, i ? 5 : 6), plate: st(f, 3), red: st('red', 11), wd: st('jade', 11), ok: st('green', 11) };
    });
    return out;
  }
  function useScheme(mode, seed, fam) {
    var sc = mode === 'radix' ? radix(fam || 'blue') : material(seed);
    ['light', 'dark'].forEach(function (t) {
      var S = P[t], L = S.lock || {}, c = sc[t]; S.over = S.over || {};
      var card = L.card ? S.over.card : c.card;
      ROLES.forEach(function (r) {
        if (L[r.id]) return;
        var v = c[r.id];
        if (r.id === 'text') v = fix(v, card, 7); else if (['text2', 'key', 'next', 'th', 'red', 'wd', 'ok'].indexOf(r.id) >= 0) v = fix(v, card, 4.5);
        S.over[r.id] = v; if (r.id === 'bg') S.bg = v; if (r.id === 'accent') S.accent = v;
      });
      S.fam = null; S.accentFam = null; S.auto = true;
    });
    P.seed = { mode: mode, hex: seed, fam: fam || null };
    commit();
  }
  function randomize() {
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; }, mode = (P.seed && P.seed.mode) || 'material';
    var f = pick(ORDER.filter(function (x) { return !NEUTRAL[x]; }));
    useScheme(mode, '#' + RDX[f][0].substr(48, 6), f);
  }
  function ensureOrig(t) {
    if (ORIG[t]) return;
    var real = document.documentElement.getAttribute('data-theme');
    clearInline(); document.documentElement.setAttribute('data-theme', t); ORIG[t] = readVars(); document.documentElement.setAttribute('data-theme', real); apply();
  }
  function compute_for(t) {   // роли для темы t (если t — не текущая, подставляем её шкалу Radix)
    var cur = theme();
    if (t === cur) return compute();
    var real = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', t);
    var r; try { r = compute(); } finally { document.documentElement.setAttribute('data-theme', real); }
    return r;
  }


  /* ================== ПРАВИЛА ДЛЯ ОТДЕЛЬНЫХ ЭЛЕМЕНТОВ ================== */
  var rstyle = document.createElement('style'); rstyle.id = 'cl-rules-style'; document.head.appendChild(rstyle);
  var PREV = null;                                   // несохранённый просмотр {theme, sel, prop, val}
  function ruleCss(r, bang) { return 'html[data-theme="' + r.theme + '"] ' + r.sel + ' { ' + r.prop + ': ' + r.val + (bang ? ' !important' : '') + '; }'; }
  function applyRules() {
    var out = P.rules.filter(function (r) { return !r.off; }).map(function (r) { return ruleCss(r, true); });
    if (PREV) out.push(ruleCss(PREV, true));
    rstyle.textContent = out.join('\n');
  }

  /* ================== ИНТЕРФЕЙС ================== */
  var css = document.createElement('style');
  css.textContent =
    '#cl-fab{position:fixed;right:12px;bottom:12px;z-index:2147483001;width:46px;height:46px;border-radius:50%;border:2px solid #fff;background:#222;color:#fff;font-size:22px;line-height:1;box-shadow:0 2px 10px rgba(0,0,0,.5);padding:0}' +
    '#cl-fab.on{background:#d6249f}' +
    '#cl-panel{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#15171c;color:#eef0f4;font:13px/1.35 -apple-system,Roboto,sans-serif;padding:8px 12px 70px;border-top:2px solid #d6249f;max-height:66vh;overflow:auto;display:none}' +
    '#cl-panel *{box-sizing:border-box;font-family:inherit}' +
    '#cl-panel .r{display:flex;align-items:center;gap:8px;margin:6px 0}' +
    '#cl-panel .sm{opacity:.7;font-size:12px;word-break:break-all}' +
    '#cl-panel .h{font-size:12px;opacity:.85;margin:10px 0 3px;font-weight:600}' +
    '#cl-panel button{background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:8px 10px;font-size:13px}' +
    '#cl-panel button.on{background:#d6249f;border-color:#d6249f}' +
    '#cl-panel .tabs{display:flex;gap:6px;margin-bottom:6px}#cl-panel .tabs button{flex:1;padding:9px 4px}' +
    '#cl-panel .pair{display:flex;gap:8px}' +
    '#cl-panel .box{flex:1;border-radius:12px;border:1px solid #555;padding:8px;text-align:center;position:relative;min-height:70px;display:flex;flex-direction:column;justify-content:center;overflow:hidden}' +
    '#cl-panel .box b{font-size:13px}#cl-panel .box small{font-size:11px;opacity:.85}' +
    '#cl-panel .box input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0}' +
    '#cl-panel .box.nw{outline:2px solid #d6249f}' +
    '#cl-panel .big{text-align:center;margin:6px 0 2px}#cl-panel .big b{font-size:24px}' +
    '#cl-panel .bd{display:flex;gap:5px;justify-content:center;flex-wrap:wrap}' +
    '#cl-panel .bd span{border-radius:7px;padding:3px 7px;font-size:11px;border:1px solid #3a4150}' +
    '#cl-panel .p{background:#12351f;border-color:#2ea043!important;color:#7ee787}#cl-panel .m{background:#3a2f10;border-color:#9e6a03!important;color:#e3b341}#cl-panel .f{background:#3b1717;border-color:#8b2b2b!important;color:#ff9b93}' +
    '#cl-panel .sg{display:flex;flex-wrap:wrap;gap:5px}' +
    '#cl-panel .sg button{padding:0;width:52px;height:42px;border-radius:8px;border:1px solid #555;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;font-size:15px;font-weight:700}' +
    '#cl-panel .sg button small{font-size:9px;font-weight:400;opacity:.85}' +
    '#cl-panel .sc{display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px}' +
    '#cl-panel .sc small{display:block;opacity:.7;font-size:11px;font-weight:400;word-break:break-all}' +
    '#cl-panel .chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}' +
    '#cl-panel .chips button{flex:none;width:34px;height:34px;border-radius:50%;padding:0;border:2px solid #3a4150}' +
    '#cl-panel .chips button.on{border-color:#fff;box-shadow:0 0 0 2px #d6249f}' +
    '#cl-panel .role{display:flex;align-items:center;gap:10px;margin:7px 0}' +
    '#cl-panel .role .sw{width:42px;height:42px;border-radius:10px;border:1px solid #666;position:relative;flex:none}' +
    '#cl-panel .role .sw input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0}' +
    '#cl-panel .role .t{flex:1;min-width:0}#cl-panel .role .t b{font-size:13px}' +
    '#cl-panel .rt{font-size:12px;padding:3px 7px;border-radius:7px;border:1px solid #3a4150;flex:none}' +
    '#cl-panel .lk{padding:6px 8px!important;font-size:15px!important;flex:none}' +
    '#cl-panel input[type=text]{background:#0e1014;color:#fff;border:1px solid #3a4150;border-radius:8px;padding:6px 8px;width:96px;font-size:14px}' +
    '#cl-panel input[type=range]{flex:1;min-width:0;height:26px;-webkit-appearance:none;appearance:none;border-radius:13px;border:1px solid #444}' +
    '#cl-panel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:2px solid #d6249f}' +
    '#cl-panel label.lb{width:76px;flex:none;font-size:12px;opacity:.85}' +
    '#cl-panel .zone{height:7px;border-radius:4px;margin:-2px 0 4px 84px;display:flex;overflow:hidden}#cl-panel .zone i{flex:1}' +
    '#cl-panel .rl{display:flex;align-items:center;gap:6px;margin:5px 0;font-size:12px}#cl-panel .rl .tx{flex:1;min-width:0;word-break:break-all}' +
    '#cl-panel .rl i{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #666;vertical-align:-2px}' +
    '#cl-bar{position:fixed;left:0;right:64px;bottom:0;z-index:2147483000;background:#15171c;padding:8px 0 10px 12px;display:none;gap:6px;flex-wrap:nowrap;overflow-x:auto}' +
    '#cl-bar button{flex:none;background:#2a2f39;color:#fff;border:1px solid #3a4150;border-radius:9px;padding:9px 10px;font-size:13px;white-space:nowrap}' +
    '#cl-bar button.on{background:#d6249f;border-color:#d6249f}#cl-bar button.ok2{background:#238636;border-color:#2ea043;font-weight:700}#cl-bar button[disabled]{opacity:.4}';
  document.head.appendChild(css);
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function $(id) { return document.getElementById(id); }
  var fab = el('button', { id: 'cl-fab', type: 'button', 'aria-label': 'Подбор цвета' }, '🎨');
  var panel = el('div', { id: 'cl-panel' }), bar = el('div', { id: 'cl-bar' });
  panel.innerHTML =
    '<div class="tabs"><button id="cl-t-pick" type="button">👆 Элемент</button><button id="cl-t-scheme" type="button">🎨 Схема</button><button id="cl-t-rules" type="button">📋 Правила</button></div>' +
    '<div id="cl-body"></div><div class="sm" id="cl-log" style="white-space:pre-wrap;margin-top:8px"></div>';
  bar.innerHTML = '<button id="cl-apply" class="ok2" type="button" disabled>✓ Готово</button><button id="cl-cancel" type="button" disabled>↶ Отмена</button><button id="cl-theme" type="button" aria-label="Тема">🌓</button><button id="cl-more" type="button">⋯ Ещё</button><button id="cl-pickmode" class="mm" type="button">👆 Выбор: вкл</button><button id="cl-copy" class="mm" type="button">Копировать CSS</button><button id="cl-close" type="button">✕</button>';
  document.body.appendChild(fab); document.body.appendChild(panel); document.body.appendChild(bar);
  var more = false, origCol = '', active = false, tab = 'pick', pickOn = true, sel = null, outlined = null, prop = 'color', cands = [], scope = 0, newHex = null, hslv = [0, 0, 50], fine = false, advOpen = false;
  var body = $('cl-body');
  function say(t) { $('cl-log').textContent = t; }
  function isUi(n) { return n === fab || panel.contains(n) || bar.contains(n); }

  /* ---------- чтение цветов элемента ---------- */
  function parseC(c) { var m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
  function bgOf(n) {
    var st = [], x = n;
    while (x && x.nodeType === 1) { var c = parseC(getComputedStyle(x).backgroundColor); if (c && c.a > 0) st.push(c); if (c && c.a >= .999) break; x = x.parentElement; }
    var res = theme() === 'dark' ? [11, 15, 23] : [255, 255, 255];
    for (var i = st.length - 1; i >= 0; i--) { var a = st[i].a; res = [st[i].r * a + res[0] * (1 - a), st[i].g * a + res[1] * (1 - a), st[i].b * a + res[2] * (1 - a)]; }
    return hex(res[0], res[1], res[2]);
  }
  function propVal(n, p) {
    var cs = getComputedStyle(n);
    if (p === 'color') { var c = parseC(cs.color); return c ? hex(c.r, c.g, c.b) : ''; }
    if (p === 'background-color') { var b = parseC(cs.backgroundColor); return b && b.a > 0 ? bgOf(n) : ''; }
    var d = parseC(cs.borderTopColor); return d && d.a > 0 ? hex(d.r, d.g, d.b) : '';
  }
  function otherOf(n, p) { return p === 'color' || p === 'border-color' ? bgOf(n) : propVal(n, 'color'); }
  function describe(n) {
    var s = n.tagName.toLowerCase(); if (n.id) s += '#' + n.id;
    clsOf(n).slice(0, 2).forEach(function (c) { s += '.' + c; });
    return s + (n.children.length ? '' : ' «' + (n.textContent || '').trim().slice(0, 22) + '»');
  }
  function clsOf(n) { return (typeof n.className === 'string' ? n.className : '').trim().split(/\s+/).filter(function (c) { return c && c.indexOf('cl-') !== 0; }); }
  function esc(s) { return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/[^\w-]/g, '\\$&'); }
  function simple(n) { var s = n.tagName.toLowerCase(); clsOf(n).slice(0, 3).forEach(function (c) { s += '.' + esc(c); }); return s; }
  function pathSel(n) {
    var parts = [], cur = n, depth = 0;
    while (cur && cur !== document.body && cur.nodeType === 1 && depth < 5) {
      var p = cur.parentElement, idx = 1;
      if (p) for (var i = 0; i < p.children.length; i++) { if (p.children[i] === cur) break; if (p.children[i].tagName === cur.tagName) idx++; }
      parts.unshift(simple(cur) + ':nth-of-type(' + idx + ')');
      if (cur.id) { parts[0] = '#' + esc(cur.id); break; }
      cur = p; depth++;
    }
    var pg = document.body.getAttribute('data-page'); return (pg ? 'body[data-page="' + pg + '"] ' : 'body ') + parts.join(' > ');
  }
  function countSel(s) { try { return Array.prototype.filter.call(document.querySelectorAll(s), function (n) { return !isUi(n); }).length; } catch (e) { return 0; } }

  /* ---------- варианты области применения ---------- */
  function buildCands() {
    cands = [];
    var cur = propVal(sel, prop); origCol = cur;
    var s1 = simple(sel), par = sel.parentElement;
    function add(o) { if (!cands.some(function (c) { return c.sel === o.sel && c.role === o.role; })) cands.push(o); }
    add({ k: 'all', title: 'Все такие же', sel: s1, n: countSel(s1) });
    if (par && par !== document.body) { var s2 = simple(par) + ' ' + s1; add({ k: 'in', title: 'Такие же внутри «' + simple(par) + '»', sel: s2, n: countSel(s2) }); }
    var s3 = pathSel(sel); add({ k: 'one', title: 'Только этот (на этой странице)', sel: s3, n: countSel(s3) });
    if (prop !== 'border-color' && cur) {
      var V = compute();
      ROLES.forEach(function (r) {
        if (V[r.id] && V[r.id].toLowerCase() === cur.toLowerCase()) {
          var n = 0, all = document.body.querySelectorAll('*'), lim = Math.min(all.length, 4000);
          for (var i = 0; i < lim; i++) if (!isUi(all[i]) && propVal(all[i], prop) === cur) n++;
          add({ k: 'role', title: 'Роль «' + r.name + '» — меняет всё с этим цветом', sel: r.vars[0], n: n, role: r.id });
        }
      });
    }
    var def = 0; if (cands[0].n > 25 && !clsOf(sel).length) def = cands.findIndex(function (c) { return c.k === 'one'; });
    scope = Math.max(0, def);
  }

  /* ---------- выбор элемента на странице ---------- */
  function iconLike(n) { return n.namespaceURI && n.namespaceURI.indexOf('svg') >= 0; }
  function choose(n) {
    var wasIcon = !!(n && iconLike(n));
    while (n && iconLike(n) && n.parentElement) n = n.parentElement;
    if (!n || n === document.documentElement) return;
    if (PREV) cancel(true);
    if (outlined) { outlined.el.style.outline = outlined.o; outlined.el.style.outlineOffset = outlined.f; }
    sel = n; outlined = { el: n, o: n.style.outline, f: n.style.outlineOffset };
    n.style.outline = '2px dashed #d6249f'; n.style.outlineOffset = '1px';
    var hasText = wasIcon || Array.prototype.some.call(n.childNodes, function (c) { return c.nodeType === 3 && c.textContent.trim(); }); var bgv = propVal(n, 'background-color');
    prop = hasText || !bgv ? 'color' : 'background-color';
    newHex = null; setTab('pick', true);
  }
  function setProp(p) { prop = p; if (PREV) cancel(true); newHex = null; if (sel) buildCands(); renderPick(); }

  /* ---------- просмотр / применение ---------- */
  function setNew(hx) {
    newHex = hx; var h = hsl(rgb(hx)); hslv = [h[0], h[1], h[2]];
    var c = cands[scope];
    if (c.k === 'role') { PREV = null; ROLE[c.role].vars.forEach(function (v) { document.documentElement.style.setProperty(v, hx); applied.indexOf(v) < 0 && applied.push(v); }); }
    else PREV = { theme: theme(), sel: c.sel, prop: prop, val: hx };
    applyRules(); $('cl-apply').disabled = false; $('cl-cancel').disabled = false;
  }
  function cancel(silent) {
    PREV = null; newHex = null; apply(); applyRules();
    $('cl-apply').disabled = true; $('cl-cancel').disabled = true;
    if (!silent) { say('Отменено'); renderPick(); }
  }
  function applyNew() {
    if (!newHex || !sel) return;
    var c = cands[scope], from = origCol;
    if (c.k === 'role') {
      var S = P[theme()]; S.over = S.over || {}; S.lock = S.lock || {}; S.over[c.role] = newHex; S.lock[c.role] = 1; S.auto = true;
      if (c.role === 'bg') S.bg = newHex; if (c.role === 'accent') S.accent = newHex;
      PREV = null; newHex = null; commit(); say('✓ Роль «' + ROLE[c.role].name + '» изменена для темы ' + theme() + ' и закрыта замком 🔒'); }
    else {
      P.rules = P.rules.filter(function (r) { return !(r.theme === theme() && r.sel === c.sel && r.prop === prop); });
      P.rules.push({ id: Date.now() + Math.random(), theme: theme(), sel: c.sel, prop: prop, val: newHex, from: from, label: describe(sel), lock: false, off: false });
      PREV = null; newHex = null; commit(); say('✓ Правило сохранено для всех страниц (' + c.n + ' эл. на этой)');
    }
    $('cl-apply').disabled = true; $('cl-cancel').disabled = true; buildCands(); renderPick();
  }

  /* ---------- подсказки: по фону и по соседям ---------- */
  function familyOf(h) {
    var q = hsl(rgb(h)); if (q[1] < 12) return 'gray';
    var best = 'gray', bd = 999;
    ORDER.forEach(function (f) { if (NEUTRAL[f]) return; var t = hsl(rgb('#' + RDX[f][0].substr(48, 6))), d = Math.min(Math.abs(t[0] - q[0]), 360 - Math.abs(t[0] - q[0])); if (d < bd) { bd = d; best = f; } });
    return best;
  }
  function neighbourColors() {
    var set = {}, out = [], nodes = [], par = sel.parentElement;
    if (par) { nodes.push(par); Array.prototype.forEach.call(par.children, function (c) { nodes.push(c); Array.prototype.forEach.call(c.children, function (cc) { nodes.push(cc); }); }); var gp = par.parentElement; if (gp) Array.prototype.forEach.call(gp.children, function (c) { nodes.push(c); }); }
    nodes.slice(0, 80).forEach(function (m) { if (m === sel || isUi(m)) return; var v = propVal(m, prop); if (v && !set[v]) { set[v] = 1; out.push(v); } });
    return out;
  }
  function suggestGroups() {
    var oc = otherOf(sel, prop), cur = (propVal(sel, prop) || '').toLowerCase(), V = compute(), min = prop === 'background-color' ? 4.5 : 4.5, seen = {}, groups = [];
    function g(title, cap) { var o = { t: title, items: [], cap: cap }; groups.push(o); return o; }
    function add(o, hx, name, need) { hx = hx.toLowerCase(); if (seen[hx] || hx === cur) return; if (ratio(hx, oc) < (need || min)) return; if (o.items.length >= o.cap) return; seen[hx] = 1; o.items.push([hx, name]); }
    var fam = familyOf(oc), n = NEUTRAL[fam] ? fam : ({ tomato: 'mauve', red: 'mauve', ruby: 'mauve', crimson: 'mauve', pink: 'mauve', plum: 'mauve', purple: 'mauve', violet: 'mauve', iris: 'slate', indigo: 'slate', blue: 'slate', sky: 'slate', cyan: 'slate', teal: 'sage', jade: 'sage', mint: 'sage', green: 'sage', grass: 'olive', lime: 'olive' }[fam] || 'sand');
    var gN = g('Как у соседей', 6); neighbourColors().forEach(function (c) { add(gN, c, 'сосед', 3); });
    var gR = g('Из вашей схемы', 6); ROLES.forEach(function (r) { if (V[r.id]) add(gR, V[r.id], r.name, 3); });
    var gP = g('Под этот ' + (prop === 'background-color' ? 'текст' : 'фон') + ' (Radix)', 10);
    if (prop === 'background-color') { [1, 2, 3, 4].forEach(function (k) { add(gP, step(fam === 'gray' ? n : fam, k), (fam === 'gray' ? n : fam) + '-' + k); }); [1, 2, 3].forEach(function (k) { add(gP, step(n, k), n + '-' + k); }); }
    else {
      [12, 11].forEach(function (k) { add(gP, step(n, k), n + '-' + k); });
      if (fam !== 'gray' && !NEUTRAL[fam]) [12, 11, 10, 9].forEach(function (k) { add(gP, step(fam, k), fam + '-' + k, k === 9 ? 3 : min); });
      ['red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'pink'].forEach(function (f) { if (f !== fam) add(gP, step(f, 11), f + '-11'); });
    }
    return groups;
  }
  function swatch(hx, name, oc) {
    var b = el('button', { type: 'button', title: name }), cr = ratio(hx, oc);
    if (prop === 'background-color') { b.style.background = hx; b.style.color = oc; } else { b.style.background = oc; b.style.color = hx; }
    b.innerHTML = 'Аа<small>' + cr.toFixed(1) + '</small>'; b.addEventListener('click', function () { setNew(hx); renderPick(); });
    return b;
  }

  /* ---------- вкладка «Элемент» ---------- */
  function badges(r) { return [['AA', 4.5], ['AA ↑', 3], ['AAA', 7]].map(function (x) { return '<span class="' + (r >= x[1] ? 'p' : 'f') + '">' + (r >= x[1] ? '✓' : '✗') + ' ' + x[0] + '</span>'; }).join(''); }
  function renderPick() {
    body.innerHTML = '';
    if (!sel) { body.innerHTML = '<div class="sm" style="padding:16px 0;font-size:15px;text-align:center">👆 Тапни любое слово, иконку или фон на странице</div>'; return; }
    var cur = propVal(sel, prop), oc = otherOf(sel, prop), shown = newHex || cur || '#000000', r = ratio(shown, oc);
    var verdict = r >= 4.5 ? '<span class="p" style="padding:3px 8px;border-radius:7px;border:1px solid">✓ читается хорошо</span>' : r >= 3 ? '<span class="m" style="padding:3px 8px;border-radius:7px;border:1px solid">⚠ слабовато</span>' : '<span class="f" style="padding:3px 8px;border-radius:7px;border:1px solid">✗ плохо видно</span>';
    var wrap = el('div');
    wrap.innerHTML =
      '<div class="r"><b style="flex:1;min-width:0;font-size:14px;word-break:break-all">' + describe(sel).replace(/</g, '&lt;') + '</b><button id="cl-p-c" type="button">Текст</button><button id="cl-p-b" type="button">Фон</button>' + (more ? '<button id="cl-p-d" type="button">Рамка</button>' : '') + '</div>' +
      '<div class="pair"><div class="box" style="background:' + (prop === 'background-color' ? cur || oc : oc) + ';color:' + (prop === 'background-color' ? oc : cur || '#888') + '"><b>Было</b><small>' + (cur || 'нет') + '</small></div>' +
      '<div class="box nw" style="background:' + (prop === 'background-color' ? shown : oc) + ';color:' + (prop === 'background-color' ? oc : shown) + '"><b>Стало</b><small id="cl-hx">' + (newHex || 'выбери ниже') + '</small><input type="color" id="cl-pk" value="' + shown + '"></div></div>' +
      '<div class="big"><span id="cl-rt" style="font-size:13px;opacity:.8">' + r.toFixed(1) + ' : 1</span> <span id="cl-vd">' + verdict + '</span></div>' +
      '<div class="h">Подходящие цвета</div><div class="sg" id="cl-sug"></div>' +
      '<div class="h">Темнее ◀──▶ светлее</div><div class="r"><input id="cl-l" type="range" min="0" max="100"></div><div class="zone" id="cl-zone" style="margin-left:0"></div>' +
      (more ? '<div class="h">Где применить</div><div class="sg" id="cl-sc" style="gap:6px"></div><div class="sm" id="cl-scd" style="margin-top:4px"></div>' +
        '<div class="r"><button id="cl-aa" type="button">Подогнать к читаемости</button></div>' +
        '<div class="r"><label class="lb">HEX</label><input id="cl-hex" type="text" maxlength="7" value="' + shown + '"></div>' +
        '<div class="r"><label class="lb">Тон</label><input id="cl-h" type="range" min="0" max="360"></div>' +
        '<div class="r"><label class="lb">Насыщ.</label><input id="cl-s" type="range" min="0" max="100"></div>' : '');
    body.appendChild(wrap);
    var hh = hsl(rgb(shown)); hslv = [hh[0], hh[1], hh[2]];
    $('cl-p-c').className = prop === 'color' ? 'on' : ''; $('cl-p-b').className = prop === 'background-color' ? 'on' : '';
    $('cl-p-c').onclick = function () { setProp('color'); }; $('cl-p-b').onclick = function () { setProp('background-color'); };
    if ($('cl-p-d')) { $('cl-p-d').className = prop === 'border-color' ? 'on' : ''; $('cl-p-d').onclick = function () { setProp('border-color'); }; }
    var sug = $('cl-sug'), caps = [4, 2, 6], flat = [];
    suggestGroups().forEach(function (g, i) { g.items.slice(0, caps[i] || 4).forEach(function (it) { flat.push(it); }); });
    flat.forEach(function (it) { sug.appendChild(swatch(it[0], it[1], oc)); });
    if (!flat.length) sug.innerHTML = '<div class="sm">Нет готовых вариантов — двигай бегунок или тапни «Стало».</div>';
    $('cl-pk').addEventListener('input', function (e) { setNew(e.target.value); liveUpd(); });
    $('cl-pk').addEventListener('change', function () { renderPick(); });
    if (more) {
      var sc = $('cl-sc');
      cands.forEach(function (c, i) {
        var short = c.k === 'all' ? 'Все такие же' : c.k === 'in' ? 'В родителе' : c.k === 'one' ? 'Только этот' : 'Роль: ' + ROLE[c.role].name.split(',')[0];
        var b = el('button', { type: 'button', style: 'width:auto;height:auto;padding:8px 10px;font-size:13px;font-weight:600;display:block;text-align:left' + (i === scope ? ';background:#d6249f;border-color:#d6249f' : '') }, short + ' · ' + c.n);
        b.addEventListener('click', function () { var nh = newHex; if (PREV) cancel(true); scope = i; if (nh) setNew(nh); renderPick(); });
        sc.appendChild(b);
      });
      var cc = cands[scope]; $('cl-scd').textContent = (cc.k === 'role' ? 'Меняет переменную ' + cc.sel + '. ' : 'Селектор: ' + cc.sel + '. ') + 'Совпадений на странице: ' + cc.n + '.';
      $('cl-aa').onclick = function () { var f = fix(shown, oc, 4.5); if (f === shown) { say('Уже читается'); return; } setNew(f); renderPick(); };
      $('cl-hex').onchange = function (e) { var v = e.target.value.trim(); if (/^#?[0-9a-f]{6}$/i.test(v)) { setNew(v[0] === '#' ? v : '#' + v); renderPick(); } };
      [['cl-h', 0], ['cl-s', 1]].forEach(function (x) { var inp = $(x[0]); inp.value = Math.round(hslv[x[1]]); inp.oninput = function () { hslv[x[1]] = parseFloat(inp.value); setNew(hex.apply(null, fromHsl(hslv[0], hslv[1], hslv[2]))); hslv[x[1]] = parseFloat(inp.value); liveUpd(); }; });
    }
    var li = $('cl-l'); li.value = Math.round(hslv[2]); li.oninput = function () { hslv[2] = parseFloat(li.value); setNew(hex.apply(null, fromHsl(hslv[0], hslv[1], hslv[2]))); hslv[2] = parseFloat(li.value); liveUpd(); };
    paintZone(oc); if (!newHex && !PREV) { $('cl-apply').disabled = true; $('cl-cancel').disabled = true; }
  }
  function paintZone(oc) {
    var z = '', i; for (i = 0; i < 40; i++) { var q = hex.apply(null, fromHsl(hslv[0], hslv[1], i * 100 / 39)), cr = ratio(q, oc); z += '<i style="background:' + (cr >= 4.5 ? '#2ea043' : cr >= 3 ? '#d29922' : '#8b2b2b') + '"></i>'; }
    var zn = $('cl-zone'); if (zn) zn.innerHTML = z;
    var lr = $('cl-l'); if (lr) { var st = []; for (i = 0; i <= 10; i++) st.push(hex.apply(null, fromHsl(hslv[0], hslv[1], i * 10))); lr.style.background = 'linear-gradient(90deg,' + st.join(',') + ')'; }
  }
  function liveUpd() {   // лёгкое обновление без перерисовки (чтобы не терять фокус бегунка)
    var oc = otherOf(sel, prop), r = ratio(newHex, oc);
    $('cl-hx').textContent = newHex; $('cl-rt').textContent = r.toFixed(1) + ' : 1';
    $('cl-vd').innerHTML = r >= 4.5 ? '<span class="p" style="padding:3px 8px;border-radius:7px;border:1px solid">✓ читается хорошо</span>' : r >= 3 ? '<span class="m" style="padding:3px 8px;border-radius:7px;border:1px solid">⚠ слабовато</span>' : '<span class="f" style="padding:3px 8px;border-radius:7px;border:1px solid">✗ плохо видно</span>';
    var nb = body.querySelector('.box.nw'); if (nb) { if (prop === 'background-color') nb.style.background = newHex; else nb.style.color = newHex; }
    var hx = $('cl-hex'); if (hx) hx.value = newHex; paintZone(oc);
  }

  /* ---------- вкладка «Схема» ---------- */
  function seedMode() { return (P.seed && P.seed.mode) || 'material'; }
  function renderScheme() {
    var S = P[theme()], V = compute(), L = S.lock || {};
    body.innerHTML =
      '<div class="sm">Вся схема из одного цвета — для обеих тем сразу. Ручные правки и замки 🔒 сохраняются.</div>' +
      '<div class="r"><button id="cl-mm" type="button">Material You</button><button id="cl-mr" type="button">Radix</button><button id="cl-rnd" type="button">🎲</button><label style="position:relative"><span style="border:1px solid #3a4150;border-radius:9px;padding:8px 10px;display:inline-block;background:#2a2f39">🎨 свой</span><input id="cl-seed" type="color" style="position:absolute;inset:0;width:100%;height:100%;opacity:0"></label></div>' +
      '<div class="chips" id="cl-fac"></div><div class="h">Роли темы: ' + (theme() === 'dark' ? 'тёмной' : 'светлой') + ' (тап по цвету — свой; 🔒 — заморозить)</div><div id="cl-roles"></div>';
    $('cl-mm').className = P.seed && seedMode() === 'material' ? 'on' : ''; $('cl-mr').className = P.seed && seedMode() === 'radix' ? 'on' : '';
    ORDER.forEach(function (f) {
      var b = el('button', { type: 'button', title: f }); b.style.background = '#' + RDX[f][0].substr(48, 6); if (P.seed && P.seed.fam === f) b.className = 'on';
      b.onclick = function () { useScheme(seedMode(), '#' + RDX[f][0].substr(48, 6), f); }; $('cl-fac').appendChild(b);
    });
    $('cl-mm').onclick = function () { var sd = P.seed || { hex: '#3e7bfa', fam: 'blue' }; useScheme('material', sd.hex, sd.fam); };
    $('cl-mr').onclick = function () { var sd = P.seed || { fam: 'blue' }; useScheme('radix', sd.hex || '#0090ff', sd.fam && !NEUTRAL[sd.fam] ? sd.fam : 'blue'); };
    $('cl-rnd').onclick = randomize;
    $('cl-seed').onchange = function (e) { var c = e.target.value; useScheme(seedMode(), c, familyOf(c)); };
    var host = $('cl-roles');
    ROLES.forEach(function (r) {
      var v = V[r.id], against = { text: 1, text2: 1, key: 1, next: 1, th: 1, red: 1, wd: 1, ok: 1 }[r.id] ? V.card : r.id === 'accent' ? V.bg : null, rt = against ? ratio(v, against) : 0;
      var min = r.id === 'text' ? 7 : 4.5, cls = !against ? '' : rt >= min ? 'p' : rt >= 3 ? 'm' : 'f';
      var row = el('div', { class: 'role' });
      row.innerHTML = '<div class="sw" style="background:' + v + '"><input type="color" value="' + v + '"></div><div class="t"><b>' + r.name + '</b><div class="sm">' + v + ' · ' + r.vars.join(' ') + '</div></div>' + (against ? '<span class="rt ' + cls + '">' + rt.toFixed(1) + '</span>' : '');
      var lk = el('button', { type: 'button', class: 'lk' + (L[r.id] ? ' on' : '') }, L[r.id] ? '🔒' : '🔓');
      lk.onclick = function () {
        S.lock = S.lock || {}; S.over = S.over || {};
        if (S.lock[r.id]) { delete S.lock[r.id]; if (r.id !== 'bg' && r.id !== 'accent') delete S.over[r.id]; } else { S.lock[r.id] = 1; if (r.id !== 'bg' && r.id !== 'accent') S.over[r.id] = V[r.id]; }
        commit();
      };
      row.appendChild(lk);
      var inp = row.querySelector('input');
      inp.oninput = function (e) { var c = e.target.value; S.over = S.over || {}; S.lock = S.lock || {}; if (r.id === 'bg') { S.bg = c; S.fam = null; delete S.over.bg; } else if (r.id === 'accent') { S.accent = c; S.accentFam = null; delete S.over.accent; } else S.over[r.id] = c; S.lock[r.id] = 1; S.auto = true; save(); apply(); row.querySelector('.sw').style.background = c; };
      inp.onchange = function () { render(); };
      host.appendChild(row);
    });
  }

  /* ---------- вкладка «Правила» ---------- */
  function renderRules() {
    body.innerHTML = '<div class="sm">Правила для отдельных элементов — работают на всех страницах и сильнее схемы. 🔒 — защитить от «Сбросить незакрытые».</div><div id="cl-rl"></div>' +
      '<div class="r"><button id="cl-rc" type="button">Сбросить незакрытые 🔓</button><button id="cl-ra" type="button">Сброс всего</button></div>';
    var host = $('cl-rl');
    if (!P.rules.length) host.innerHTML = '<div class="sm" style="margin:8px 0">— правил нет. Выбери элемент на вкладке «Элемент» и нажми «✓ Применить».</div>';
    P.rules.forEach(function (r, i) {
      var row = el('div', { class: 'rl', style: r.off ? 'opacity:.45' : '' });
      row.innerHTML = '<div class="tx"><b>' + r.theme + '</b> · ' + r.label.replace(/</g, '&lt;') + '<br><span class="sm">' + r.sel + ' · ' + (r.prop === 'color' ? 'текст' : r.prop === 'background-color' ? 'фон' : 'граница') + ' <i style="background:' + r.from + '"></i>→<i style="background:' + r.val + '"></i> ' + r.val + '</span></div>';
      var bl = el('button', { type: 'button', class: r.lock ? 'on' : '' }, r.lock ? '🔒' : '🔓'); bl.onclick = function () { r.lock = !r.lock; commit(); };
      var bo = el('button', { type: 'button' }, r.off ? '🚫' : '👁'); bo.onclick = function () { r.off = !r.off; commit(); };
      var bx = el('button', { type: 'button' }, '✕'); bx.onclick = function () { P.rules.splice(i, 1); commit(); };
      row.appendChild(bl); row.appendChild(bo); row.appendChild(bx); host.appendChild(row);
    });
    $('cl-rc').onclick = function () { P.rules = P.rules.filter(function (r) { return r.lock; }); commit(); say('Незакрытые правила удалены'); };
    $('cl-ra').onclick = function () { P = { light: {}, dark: {}, seed: null, rules: [] }; PREV = null; commit(); say('Всё сброшено'); };
  }

  /* ---------- общее ---------- */
  function render() {
    panel.querySelector('.tabs').style.display = more ? 'flex' : 'none'; Array.prototype.forEach.call(bar.querySelectorAll('.mm'), function (b) { b.style.display = more ? '' : 'none'; });
    $('cl-more').className = more ? 'on' : ''; if (!more && tab !== 'pick') tab = 'pick';
    ['pick', 'scheme', 'rules'].forEach(function (t) { $('cl-t-' + t).className = tab === t ? 'on' : ''; });
    $('cl-apply').style.display = tab === 'pick' ? '' : 'none'; $('cl-cancel').style.display = tab === 'pick' ? '' : 'none';
    if (tab === 'pick') renderPick(); else if (tab === 'scheme') renderScheme(); else renderRules();
    if (active) document.body.style.paddingBottom = (panel.offsetHeight + 12) + 'px';
  }
  function commit() { save(); apply(); applyRules(); render(); }
  function setTab(t, keep) { tab = t; if (t === 'pick' && sel) { buildCands(); } render(); }
  function cssText() {
    var out = [];
    ['light', 'dark'].forEach(function (t) {
      var S = P[t]; if (!S.bg && !S.accent && !S.auto && !(S.over && Object.keys(S.over).length)) return;
      ensureOrig(t);
      var tmp = compute_for(t), lines = [];
      ROLES.forEach(function (r) { r.vars.forEach(function (v) { if (tmp[r.id] && tmp[r.id] !== ORIG[t][v]) lines.push('  ' + v + ': ' + tmp[r.id] + ';'); }); });
      if (tmp.accent && tmp.accent !== ORIG[t]['--accent']) lines.push('  --accent-text: ' + (ratio('#ffffff', tmp.accent) >= ratio('#000000', tmp.accent) ? '#ffffff' : '#000000') + ';');
      if (lines.length) out.push('html[data-theme="' + t + '"] {\n' + lines.join('\n') + '\n}');
    });
    var rl = P.rules.filter(function (r) { return !r.off; }).map(function (r) { return ruleCss(r, false) + '   /* ' + r.label + ' · было ' + r.from + ' */'; });
    if (rl.length) out.push('/* правила для элементов */\n' + rl.join('\n'));
    return out.join('\n\n') || '/* ничего не менялось */';
  }
  function setActive(v) {
    active = v; fab.classList.toggle('on', v); panel.style.display = v ? 'block' : 'none'; bar.style.display = v ? 'flex' : 'none';
    document.body.style.paddingBottom = v ? (panel.offsetHeight + 12) + 'px' : '';
    if (v) render(); else { if (PREV) cancel(true); if (outlined) { outlined.el.style.outline = outlined.o; outlined.el.style.outlineOffset = outlined.f; outlined = null; } sel = null; }
  }
  fab.addEventListener('click', function (e) { e.stopPropagation(); setActive(!active); });
  $('cl-close').onclick = function () { setActive(false); };
  ['pick', 'scheme', 'rules'].forEach(function (t) { $('cl-t-' + t).onclick = function () { if (PREV && t !== 'pick') cancel(true); setTab(t); }; });
  $('cl-apply').onclick = applyNew; $('cl-cancel').onclick = function () { cancel(false); };
  $('cl-more').onclick = function () { if (PREV) cancel(true); more = !more; if (sel && tab === 'pick') buildCands(); render(); };
  $('cl-pickmode').onclick = function () { pickOn = !pickOn; $('cl-pickmode').textContent = pickOn ? '👆 Выбор: вкл' : '🔗 Выбор: выкл'; $('cl-pickmode').className = pickOn ? '' : 'on'; };
  $('cl-copy').onclick = function () { var t = cssText(), done = function () { say('Скопировано:\n' + t); }; try { navigator.clipboard.writeText(t).then(done, function () { say(t); }); } catch (e) { say(t); } };
  $('cl-theme').onclick = function () {
    if (PREV) cancel(true);
    var nx = theme() === 'dark' ? 'light' : 'dark';
    clearInline(); try { localStorage.setItem('theme', nx); } catch (e) {}
    if (window.Rozklad && Rozklad.applyTheme) Rozklad.applyTheme(nx); else document.documentElement.setAttribute('data-theme', nx);
    if (!ORIG[nx]) ORIG[nx] = readVars();
    apply(); applyRules(); if (sel) { newHex = null; buildCands(); } render();
  };
  document.addEventListener('click', function (e) {
    if (!active || tab !== 'pick' || !pickOn || isUi(e.target)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); choose(e.target);
  }, true);
  window.addEventListener('resize', function () { if (active) document.body.style.paddingBottom = (panel.offsetHeight + 12) + 'px'; });

  ORIG[theme()] = readVars();
  apply(); applyRules();
})();
