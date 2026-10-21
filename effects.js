/* ЕФЕКТ НА ЕКРАНІ: листя або сніг (легкий canvas поверх сторінки, натискання проходять крізь нього).
   Налаштування — на сторінці Info: «Вкл/Викл» і «Листя/Сніг». Зберігаються на телефоні (localStorage).
   Зупиняється, коли додаток згорнуто; вимкнений за замовчуванням, якщо в системі ввімкнено «зменшити анімацію». */
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

  var cv = null, ctx = null, W = 0, H = 0, dpr = 1, parts = [], raf = 0, last = 0;
  var LEAF_COLORS = ['#d9822b', '#c0392b', '#e0a526', '#a8531c', '#b5651d', '#cf6a2a'];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function dark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function make(initial) {
    var leaf = state.kind === 'leaves';
    return {
      x: rnd(0, W), y: initial ? rnd(-20, H) : rnd(-40, -10),
      vy: leaf ? rnd(28, 55) : rnd(22, 46),
      sway: rnd(14, 38), swaySpd: rnd(0.5, 1.3), ph: rnd(0, 6.28),
      s: leaf ? rnd(6, 10) : rnd(1.6, 3.6),
      rot: rnd(0, 6.28), vr: rnd(-1.4, 1.4), flip: rnd(0, 6.28), flipSpd: rnd(1.2, 2.6),
      col: LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0],
      a: leaf ? rnd(0.7, 0.9) : rnd(0.55, 0.9), base: 0
    };
  }

  function fill() {
    var n = Math.max(14, Math.min(32, Math.round(W * H / 18000)));
    parts = [];
    for (var i = 0; i < n; i++) { var p = make(true); p.base = p.x; parts.push(p); }
  }

  function resize() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawLeaf(p) {
    var s = p.s;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(0.35 + 0.65 * Math.abs(Math.cos(p.flip)), 1);   // перекидається в польоті
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.95, -s * 0.15, 0, s);
    ctx.quadraticCurveTo(-s * 0.95, -s * 0.15, 0, -s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,10,.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.8); ctx.lineTo(0, s * 1.15); ctx.stroke();
    ctx.restore();
  }

  function drawFlake(p, rgb) {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = rgb;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.2832); ctx.fill();
  }

  function frame(t) {
    raf = 0;
    if (!state.on || document.hidden) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
    ctx.clearRect(0, 0, W, H);
    var leaf = state.kind === 'leaves', rgb = dark() ? '#ffffff' : '#7f9cc0';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y += p.vy * dt;
      p.ph += p.swaySpd * dt;
      p.x = p.base + Math.sin(p.ph) * p.sway;
      if (leaf) { p.rot += p.vr * dt; p.flip += p.flipSpd * dt; }
      if (p.y > H + 20) { var q = make(false); q.base = q.x; parts[i] = p = q; }
      if (leaf) drawLeaf(p); else drawFlake(p, rgb);
    }
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
