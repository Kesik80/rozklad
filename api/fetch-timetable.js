// api/fetch-timetable.js
// Vercel Serverless Function
// Проксирует запрос к swrailway.gov.ua і парсить розклад поїзда
// Використання: GET /api/fetch-timetable?tid=28320
// Для діагностики: GET /api/fetch-timetable?tid=28320&debug=1
//   (поверне ще й кусок сирого HTML, щоб бачити що реально відповів сайт)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { tid, debug } = req.query;

    if (!tid || !/^\d+$/.test(tid)) {
      return res.status(400).json({ error: 'Потрібен параметр tid (число)' });
    }

    const url = `https://swrailway.gov.ua/timetable/eltrain3-5/?tid=${tid}`;

    let html;
    let upstreamStatus;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9',
          'Referer': 'https://swrailway.gov.ua/timetable/eltrain3-5/',
        },
        signal: AbortSignal.timeout(10000),
      });

      upstreamStatus = response.status;
      html = await response.text();

      if (!response.ok) {
        return res.status(502).json({
          error: `swrailway відповів ${response.status}`,
          upstreamStatus,
          bodySnippet: debug ? html.slice(0, 1500) : html.slice(0, 300),
        });
      }
    } catch (e) {
      // Сюди потрапляємо якщо: таймаут, DNS-помилка, сайт заблокував IP Vercel,
      // або AbortSignal.timeout не підтримується в поточному Node-рантаймі
      return res.status(502).json({
        error: `Не вдалось завантажити: ${e.message}`,
        errorName: e.name,
        hint: 'Якщо помилка типу "AbortSignal.timeout is not a function" — у Vercel project Settings → General → Node.js Version виставлено застарілу версію, потрібно 18.x або новіше. Якщо помилка типу "fetch failed" / timeout — ймовірно swrailway.gov.ua блокує запити з дата-центру Vercel.',
      });
    }

    if (!html || html.length < 200) {
      return res.status(502).json({
        error: 'swrailway повернув порожню або занадто коротку відповідь',
        upstreamStatus,
        bodySnippet: html ? html.slice(0, 500) : null,
      });
    }

    const result = parseTimetable(html, tid);

    if (debug) {
      result._debug = {
        htmlLength: html.length,
        htmlSnippet: html.slice(0, 1500),
        looksLikeChallenge: /cloudflare|just a moment|captcha|access denied/i.test(html),
      };
    }

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
    return res.status(200).json(result);
  } catch (e) {
    // Захист від будь-якого непередбаченого збою — щоб клієнт завжди отримав JSON, а не HTML-сторінку 500
    return res.status(500).json({ error: `Внутрішня помилка функції: ${e.message}`, stack: e.stack });
  }
}

function parseTimetable(html, tid) {
  const trainNumMatch = html.match(/Поїзд[:\s№#]*(\d{4})/i)
    || html.match(/<b[^>]*>(\d{4})<\/b>/)
    || html.match(/tid=\d+"[^>]*>(\d{4})/);
  const trainNum = trainNumMatch ? trainNumMatch[1] : null;

  const routeMatch = html.match(/([А-ЯІЇЄа-яіїє\s\-]+)\s*[–—-]\s*([А-ЯІЇЄа-яіїє\s\-]+)\s*<br/);
  const routeTitle = routeMatch ? `${routeMatch[1].trim()} — ${routeMatch[2].trim()}` : '';

  const stations = [];
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const row = match[1];
    const cells = [];
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
    let cell;
    while ((cell = cellRegex.exec(row)) !== null) {
      const text = cell[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      cells.push(text);
    }

    if (cells.length >= 4) {
      const name = cells[1];
      const arr = cells[2];
      const dep = cells[3];

      if (name && /[А-ЯІЇЄа-яіїє]{2,}/.test(name)) {
        const timeRegex = /^\d{2}:\d{2}$/;
        // Пропускаємо рядок-заголовок таблиці (Пункт / приб. / відпр.)
        if (name === 'Пункт') continue;
        stations.push({
          name: name.replace(/^\d+\s*/, '').trim(),
          arr: timeRegex.test(arr) ? arr : null,
          dep: timeRegex.test(dep) ? dep : null,
        });
      }
    }
  }

  return {
    tid,
    trainNum,
    routeTitle,
    stations,
  };
}