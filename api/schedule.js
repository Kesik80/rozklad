// /api/schedule.js — Vercel Serverless Function: серверна частина редактора розкладу (editor.html)
//
// Редактор НІКОЛИ не бачить GitHub-токен: усі звернення до GitHub робить цей файл.
// Клієнт шле пароль один раз (action: "login") і отримує підписану сесію (на 30 днів, продовжується
// при кожному зверненні). Пароль у браузері не зберігається.
//
// POST /api/schedule   тіло JSON:
//   { action: "login", password }                       → { ok, token }
//   { action: "load" }            + Authorization: Bearer <token> → { ok, content, sha, ... }
//   { action: "save", content, sha, message } + Authorization    → { ok, sha, commitUrl }
//
// ЗМІННІ СЕРЕДОВИЩА (Vercel → Project → Settings → Environment Variables):
//   EDITOR_PASSWORD         — пароль редактора                                   (обов'язково)
//   GITHUB_TOKEN            — токен GitHub з правом запису в репозиторій          (обов'язково)
//                             fine-grained: Repository = Kesik80/rozklad, Contents = Read and write
//   SCHEDULE_REPO           — "власник/репозиторій", за замовчуванням Kesik80/rozklad
//   SCHEDULE_BRANCH         — гілка, за замовчуванням main
//   SCHEDULE_FILE           — файл, за замовчуванням schedule-data.js
//   EDITOR_SESSION_SECRET   — (необов'язково) секрет підпису сесій; інакше береться з пароля + токена,
//                             тобто зміна пароля або токена розлогінює всі пристрої
//   EDITOR_SESSION_DAYS     — (необов'язково) скільки днів живе сесія, за замовчуванням 30

import { createHmac, createHash, timingSafeEqual } from 'crypto';
import { Script } from 'vm';

const REPO = process.env.SCHEDULE_REPO || 'Kesik80/rozklad';
const BRANCH = process.env.SCHEDULE_BRANCH || 'main';
const FILE = process.env.SCHEDULE_FILE || 'schedule-data.js';
const SESSION_MS = (Number(process.env.EDITOR_SESSION_DAYS) || 30) * 86400000;
const MAX_CONTENT = 400000;   // байт-ліміт на файл розкладу

/* ---------- допоміжне ---------- */
const sha256 = s => createHash('sha256').update(String(s), 'utf8').digest();
function same(a, b) { return timingSafeEqual(sha256(a), sha256(b)); }
const b64u = buf => Buffer.from(buf).toString('base64url');

function secret() {
  return process.env.EDITOR_SESSION_SECRET ||
    createHash('sha256').update('sched|' + process.env.EDITOR_PASSWORD + '|' + process.env.GITHUB_TOKEN).digest('hex');
}
function sign(body) { return createHmac('sha256', secret()).update(body).digest(); }

function makeToken() {
  const body = b64u(JSON.stringify({ exp: Date.now() + SESSION_MS }));
  return body + '.' + b64u(sign(body));
}
function checkToken(token) {
  if (typeof token !== 'string' || token.length > 400) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  let ok = false;
  try {
    const want = sign(body), got = Buffer.from(sig, 'base64url');
    ok = got.length === want.length && timingSafeEqual(got, want);
    if (!ok) return false;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return typeof p.exp === 'number' && p.exp > Date.now();
  } catch (e) { return false; }
}

// найпростіший захист від добору пароля (у межах «теплого» екземпляра функції)
const fails = new Map();   // ip → { n, until }
function throttled(ip) {
  const f = fails.get(ip);
  return !!(f && f.until > Date.now());
}
function noteFail(ip) {
  const f = fails.get(ip) || { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= 5) { f.until = Date.now() + 10 * 60000; f.n = 0; }
  fails.set(ip, f);
}

function ghHeaders() {
  return {
    Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'rozklad-editor'
  };
}
const ghUrl = () => `https://api.github.com/repos/${REPO}/contents/${encodeURI(FILE)}`;

function fail(res, code, msg, extra) {
  return res.status(code).json(Object.assign({ ok: false, error: msg }, extra || {}));
}

/* ---------- обробник ---------- */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // CORS не вмикаємо навмисно: редактор працює з того ж домену, що й API.

  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');

  // запит має йти з нашого ж сайту
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    let oh = '';
    try { oh = new URL(origin).host; } catch (e) { /* порожньо */ }
    if (oh !== host) return fail(res, 403, 'Forbidden origin');
  }

  if (!process.env.EDITOR_PASSWORD || !process.env.GITHUB_TOKEN) {
    return fail(res, 500, 'Сервер не налаштований: потрібні EDITOR_PASSWORD і GITHUB_TOKEN');
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return fail(res, 400, 'Некоректний запит');
  const action = body.action;

  /* --- вхід --- */
  if (action === 'login') {
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
    if (throttled(ip)) return fail(res, 429, 'Забагато спроб. Зачекайте 10 хвилин.');
    await new Promise(r => setTimeout(r, 500 + Math.random() * 200));
    if (typeof body.password !== 'string' || !same(body.password, process.env.EDITOR_PASSWORD)) {
      noteFail(ip);
      return fail(res, 401, 'Невірний пароль');
    }
    fails.delete(ip);
    return res.status(200).json({ ok: true, token: makeToken() });
  }

  /* --- далі потрібна сесія --- */
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!checkToken(token)) return fail(res, 401, 'Сесія закінчилась — увійдіть ще раз', { relogin: true });
  const renewed = makeToken();   // «ковзна» сесія: кожне звернення продовжує її

  try {
    /* --- завантажити файл --- */
    if (action === 'load') {
      const r = await fetch(`${ghUrl()}?ref=${encodeURIComponent(BRANCH)}`, { headers: ghHeaders(), signal: AbortSignal.timeout(15000) });
      if (!r.ok) return fail(res, 502, `GitHub відповів ${r.status} при читанні файлу`);
      const j = await r.json();
      if (j.encoding !== 'base64' || typeof j.content !== 'string') return fail(res, 502, 'Файл завеликий або має незвичний формат');
      const content = Buffer.from(j.content, 'base64').toString('utf8');
      return res.status(200).json({ ok: true, content, sha: j.sha, repo: REPO, branch: BRANCH, file: FILE, token: renewed });
    }

    /* --- зберегти (коміт) --- */
    if (action === 'save') {
      const { content, sha } = body;
      let message = typeof body.message === 'string' ? body.message.trim() : '';
      if (typeof content !== 'string' || !content.trim()) return fail(res, 400, 'Порожній файл');
      if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT) return fail(res, 400, 'Файл завеликий');
      if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) return fail(res, 400, 'Немає sha базової версії');
      if (!content.includes('window.SCHEDULE')) return fail(res, 400, 'У файлі немає window.SCHEDULE');
      // синтаксис перевіряємо БЕЗ виконання коду
      try { new Script(content, { filename: FILE }); }
      catch (e) { return fail(res, 400, 'Синтаксична помилка: ' + e.message); }
      if (!message) message = 'Розклад: оновлено через редактор';
      message = message.slice(0, 200);

      const r = await fetch(ghUrl(), {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders()),
        body: JSON.stringify({ message, content: Buffer.from(content, 'utf8').toString('base64'), sha, branch: BRANCH }),
        signal: AbortSignal.timeout(20000)
      });
      if (r.status === 409 || r.status === 422) {
        return fail(res, 409, 'Файл на GitHub змінився після завантаження (наприклад, через GitUp). Оновіть редактор.', { conflict: true, token: renewed });
      }
      if (!r.ok) return fail(res, 502, `GitHub відповів ${r.status} при записі`);
      const j = await r.json();
      return res.status(200).json({ ok: true, sha: j.content && j.content.sha, commitUrl: j.commit && j.commit.html_url, token: renewed });
    }

    return fail(res, 400, 'Невідома дія');
  } catch (e) {
    return fail(res, 502, 'Помилка зв’язку з GitHub: ' + (e && e.message ? e.message : e));
  }
}
