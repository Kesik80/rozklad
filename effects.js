/* ЕФЕКТ НА ЕКРАНІ: листя або сніг (легкий canvas поверх сторінки, натискання проходять крізь нього).
   Налаштування — на сторінці Info: «Вкл/Викл» і «Листя/Сніг». Зберігаються на телефоні (localStorage).
   Зупиняється, коли додаток згорнуто; вимкнений за замовчуванням, якщо в системі ввімкнено «зменшити анімацію».
   Листя: клен, дуб, береза, осика, верба — різні кольори, перекидаються в польоті.
   Сніг: м'які крупинки з глибиною (дальні дрібніші й повільніші) + справжні шестипроменеві сніжинки; обидва — під поривами вітру. */
(function () {
  'use strict';
  var KEY = 'fx-v1';
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var state = { on: !reduce, kind: 'leaves' };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) { state.on = !!saved.on; state.kind = saved.kind === 'snow' ? 'snow' : 'leaves'; }
  } catch (e) {}

  var cv = null, ctx = null, W = 0, H = 0, dpr = 1, parts = [], raf = 0, last = 0, clock = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function dark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  /* ---------- ЛИСТЯ: контури одиничного розміру (кінчик угорі, черешок унизу) ---------- */
  function bodyPath(width, n) {                 // симетричний листок: ширина як функція висоти u∈[-1;1]
    var p = new Path2D(), i, u, pts = [];
    for (i = 0; i <= n; i++) { u = -1 + 2 * i / n; pts.push([width(u), u]); }
    p.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
    for (i = pts.length - 1; i >= 0; i--) p.lineTo(-pts[i][0], pts[i][1]);
    p.closePath();
    return p;
  }
  function sq(u) { return Math.sqrt(Math.max(0, 1 - u * u)); }

  var SHAPES = null;
  function shapes() {
    if (SHAPES) return SHAPES;
    var maple = new Path2D(), mv = [], i, j;
    /* клен: 5 загострених часток (кут від «вгору», радіус), між ними виїмки; краї з дрібними зубцями */
    var key = [[0, 1], [24, 0.46], [52, 0.92], [78, 0.5], [104, 0.7], [128, 0.34], [158, 0.3]], poly = [], pt, k0, k1, t, th, r, rr;
    function P(a, r) { var th = a * Math.PI / 180; return [r * Math.sin(th), -r * Math.cos(th) + 0.12]; }
    for (i = 0; i < key.length - 1; i++) {
      k0 = key[i]; k1 = key[i + 1];
      for (j = 0; j < 4; j++) {
        t = j / 4; th = k0[0] + (k1[0] - k0[0]) * t; r = k0[1] + (k1[1] - k0[1]) * t;
        rr = (j % 2) ? r * 0.9 : r;                                       // зубці
        poly.push(P(th, rr));
      }
    }
    poly.push(P(158, 0.3));
    maple.moveTo(0, 0.12 - 1);
    for (i = 1; i < poly.length; i++) maple.lineTo(poly[i][0], poly[i][1]);
    maple.lineTo(0, 0.55);
    for (i = poly.length - 1; i >= 1; i--) maple.lineTo(-poly[i][0], poly[i][1]);
    maple.closePath();
    [0, 52, 104].forEach(function (a, n) { var q = P(a, [0.95, 0.85, 0.62][n]); mv.push([0, 0.55, q[0], q[1]]); if (a) mv.push([0, 0.55, -q[0], q[1]]); });
    var oak = bodyPath(function (u) {                                         // дуб: округлі частки з глибокими виїмками
      var env = 0.62 * Math.pow(sq(u), 0.75) * (1 + 0.22 * u * -1 + 0.0), lobe = Math.abs(Math.sin((u + 1) * 3.4 * Math.PI / 2 + 0.5));
      return env * (0.42 + 0.58 * Math.pow(lobe, 0.6));
    }, 120);
    SHAPES = [
      { path: maple, veins: mv },
      { path: oak, veins: 'pinnate' },   // дуб
      { path: bodyPath(function (u) { return 0.62 * sq(u) * (1 - 0.28 * u) * (1 + 0.05 * Math.sin(u * 38)); }, 48), veins: 'pinnate' }, // береза
      { path: bodyPath(function (u) { return 0.92 * Math.pow(sq(u), 0.9) * (1 - 0.15 * u); }, 36), veins: 'pinnate' },                // осика
      { path: bodyPath(function (u) { return 0.26 * sq(u); }, 30), veins: 'mid' }                                                    // верба
    ];
    return SHAPES;
  }

  var SIZE = [1.35, 1.25, 0.72, 0.85, 1.0];   // клен, дуб — великі; береза — дрібна; осика, верба — середні
  var LEAF_COLORS = [
    ['#d9822b', '#9c4f12'], ['#c0392b', '#7d1f16'], ['#e0a526', '#a06f0a'], ['#b5651d', '#6f3a0c'],
    ['#8c5a2b', '#55331a'], ['#9aa63a', '#5f6a18'], ['#cf6a2a', '#8a3a0d'], ['#a62d22', '#661710']
  ];

  function drawLeaf(p) {
    var sh = p.shape, s = p.s;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(s * (0.3 + 0.7 * Math.abs(Math.cos(p.flip))), s);       // перекидається в польоті
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.col[0];
    ctx.fill(sh.path);
    ctx.globalAlpha = p.a * 0.55;
    ctx.strokeStyle = p.col[1];
    ctx.lineWidth = 0.09;
    ctx.lineCap = 'round';
    ctx.stroke(sh.path);
    ctx.beginPath();
    if (sh.veins === 'pinnate') {
      ctx.moveTo(0, 1.12); ctx.lineTo(0, -0.9);
      for (var k = 0; k < 4; k++) { var u = 0.5 - k * 0.38, w = 0.35 * sq(u); ctx.moveTo(0, u + 0.1); ctx.lineTo(w, u - 0.22); ctx.moveTo(0, u + 0.1); ctx.lineTo(-w, u - 0.22); }
    } else if (sh.veins === 'mid') {
      ctx.moveTo(0, 1.12); ctx.lineTo(0, -0.9);
    } else {
      ctx.moveTo(0, 1.15);
      for (var j = 0; j < sh.veins.length; j++) { var v = sh.veins[j]; ctx.moveTo(v[0], v[1]); ctx.lineTo(v[2], v[3]); }
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- СНІГ ---------- */
  var sprite = { dark: null, light: null };
  function dotSprite(isDark) {                  // м'яка крупинка з розмитим краєм (малюється раз)
    var key = isDark ? 'dark' : 'light';
    if (sprite[key]) return sprite[key];
    var c = document.createElement('canvas'); c.width = c.height = 48;
    var g = c.getContext('2d'), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24), rgb = isDark ? '255,255,255' : '120,148,186';
    gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(0.7, 'rgba(' + rgb + ',.9)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 48, 48);
    return (sprite[key] = c);
  }

  function drawCrystal(p, isDark) {
    var r = p.s, k;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.a;
    ctx.strokeStyle = isDark ? '#ffffff' : '#6d8db6';
    ctx.lineWidth = Math.max(0.8, r * 0.16);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (k = 0; k < 6; k++) {
      ctx.rotate(Math.PI / 3);
      ctx.moveTo(0, 0); ctx.lineTo(r, 0);
      ctx.moveTo(r * 0.38, 0); ctx.lineTo(r * 0.58, r * 0.2);
      ctx.moveTo(r * 0.38, 0); ctx.lineTo(r * 0.58, -r * 0.2);
      ctx.moveTo(r * 0.68, 0); ctx.lineTo(r * 0.92, r * 0.26);
      ctx.moveTo(r * 0.68, 0); ctx.lineTo(r * 0.92, -r * 0.26);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- ЧАСТИНКИ ---------- */
  function make(initial) {
    var leaf = state.kind === 'leaves', z = rnd(0.45, 1);          // z — «близькість»: більше = ближче, більше, швидше
    var p = { z: z, x: rnd(-10, W + 10), y: initial ? rnd(-30, H) : rnd(-60, -10), ph: rnd(0, 6.28), flip: rnd(0, 6.28) };
    if (leaf) {
      p.shape = shapes()[(Math.random() * 5) | 0];
      p.col = LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0];
      p.s = 8.5 * SIZE[SHAPES.indexOf(p.shape)] * rnd(0.9, 1.1) * (0.7 + z * 0.75);
      p.vy = rnd(30, 52) * (0.7 + z * 0.5);
      p.swayV = rnd(18, 42); p.swaySpd = rnd(0.7, 1.5);
      p.rot0 = rnd(0, 6.28); p.rotAmp = rnd(0.5, 1.1); p.spin = rnd(-0.5, 0.5);
      p.flipSpd = rnd(1.4, 3.0); p.a = 0.62 + z * 0.3;
      p.rot = p.rot0;
    } else {
      p.crystal = Math.random() < 0.5;
      p.s = p.crystal ? rnd(6, 10.5) * (0.7 + z * 0.5) : rnd(1.1, 2.4) * (0.6 + z * 0.8);
      p.vy = rnd(24, 46) * (0.55 + z * 0.65);
      p.swayV = rnd(8, 22); p.swaySpd = rnd(0.5, 1.2);
      p.rot = rnd(0, 6.28); p.spin = rnd(-0.6, 0.6);
      p.a = p.crystal ? 0.7 + z * 0.3 : 0.5 + z * 0.45;
    }
    return p;
  }

  function fill() {
    var n = Math.max(16, Math.min(34, Math.round(W * H / 16000)));
    if (state.kind === 'snow') n = Math.round(n * 1.6);
    parts = [];
    for (var i = 0; i < n; i++) parts.push(make(true));
  }

  function wind() {                              // загальний вітер: повільна хвиля + пориви, px/с
    return 14 * Math.sin(clock * 0.23) + 9 * Math.sin(clock * 0.61 + 1.3) + 12 * Math.max(0, Math.sin(clock * 0.11 + 0.5)) ** 3;
  }

  function resize() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(t) {
    raf = 0;
    if (!state.on || document.hidden) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; clock += dt;
    ctx.clearRect(0, 0, W, H);
    var leaf = state.kind === 'leaves', isDark = dark(), wd = wind(), i, p, spr = leaf ? null : dotSprite(isDark);
    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      p.ph += p.swaySpd * dt;
      p.y += p.vy * dt;
      p.x += (Math.sin(p.ph) * p.swayV + wd * (leaf ? 1.1 : 0.7) * p.z) * dt;
      if (leaf) {
        p.flip += p.flipSpd * dt;
        p.rot0 += p.spin * dt;
        p.rot = p.rot0 + Math.sin(p.ph) * p.rotAmp;                // гойдається, як маятник
      } else if (p.crystal) {
        p.rot += p.spin * dt;
      }
      if (p.y > H + 24 || p.x < -40 || p.x > W + 40) {
        if (p.y > H + 24) { parts[i] = p = make(false); }
        else p.x = p.x < 0 ? W + 30 : -30;
      }
      if (leaf) drawLeaf(p);
      else if (p.crystal) drawCrystal(p, isDark);
      else { ctx.globalAlpha = p.a; ctx.drawImage(spr, p.x - p.s * 1.6, p.y - p.s * 1.6, p.s * 3.2, p.s * 3.2); }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!state.on) return;
    if (!cv) {
      cv = document.createElement('canvas');
      cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:50';
      document.body.appendChild(cv);
      ctx = cv.getContext('2d');
      resize();
    }
    if (!parts.length) fill();
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (cv) { cv.remove(); cv = null; ctx = null; }
    parts = [];
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  window.FX = {
    get: function () { return { on: state.on, kind: state.kind }; },
    set: function (o) {
      if (o.kind) state.kind = o.kind === 'snow' ? 'snow' : 'leaves';
      if (typeof o.on === 'boolean') state.on = o.on;
      save();
      parts = [];                       // перемалювати з новим видом
      if (state.on) start(); else stop();
    }
  };

  window.addEventListener('resize', function () { if (cv) { resize(); fill(); } });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
