// api/fetch-timetable.js
// Vercel Serverless Function
// Парсить розклад поїзду через ScrapingBee (обходить блокування swrailway.gov.ua)
// Використання: GET /api/fetch-timetable?tid=28320

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tid } = req.query;

  if (!tid || !/^\d+$/.test(tid)) {
    return res.status(400).json({ error: 'Потрібен параметр tid (число)' });
  }

  const apiKey = process.env.SCRAPINGBEE_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SCRAPINGBEE_KEY не налаштований у Vercel' });
  }

  const targetUrl = `https://swrailway.gov.ua/timetable/eltrain3-5/?tid=${tid}`;
  const proxyUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render_js=false`;

  let html;
  try {
    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `ScrapingBee відповів ${response.status}`, detail: errText.slice(0, 200) });
    }

    html = await response.text();
  } catch (e) {
    return res.status(502).json({ error: `Не вдалось завантажити: ${e.message}` });
  }

  const result = parseTimetable(html, tid);

  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
  return res.status(200).json(result);
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
        stations.push({
          name: name.replace(/^\d+\s*/, '').trim(),
          arr: timeRegex.test(arr) ? arr : null,
          dep: timeRegex.test(dep) ? dep : null,
        });
      }
    }
  }

  return { tid, trainNum, routeTitle, stations };
}
