// api/fetch-timetable.js
// Vercel Serverless Function
// Проксирует запрос к swrailway.gov.ua и парсит расписание поезда
// Использование: GET /api/fetch-timetable?tid=28320

export default async function handler(req, res) {
  // CORS — разрешаем запросы с нашего сайта
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tid } = req.query;

  if (!tid || !/^\d+$/.test(tid)) {
    return res.status(400).json({ error: 'Потрібен параметр tid (число)' });
  }

  const url = `https://swrailway.gov.ua/timetable/eltrain3-5/?tid=${tid}`;

  let html;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'uk-UA,uk;q=0.9',
        'Referer': 'https://swrailway.gov.ua/timetable/eltrain3-5/',
      },
      // Таймаут 10 секунд
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `swrailway відповів ${response.status}` });
    }

    html = await response.text();
  } catch (e) {
    return res.status(502).json({ error: `Не вдалось завантажити: ${e.message}` });
  }

  // ---- Парсинг ----
  const result = parseTimetable(html, tid);

  // Кешуємо відповідь на 6 годин
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
  return res.status(200).json(result);
}

function parseTimetable(html, tid) {
  // Витягуємо номер поїзду
  const trainNumMatch = html.match(/Поїзд[:\s№#]*(\d{4})/i)
    || html.match(/<b[^>]*>(\d{4})<\/b>/)
    || html.match(/tid=\d+"[^>]*>(\d{4})/);
  const trainNum = trainNumMatch ? trainNumMatch[1] : null;

  // Витягуємо заголовок маршруту
  const routeMatch = html.match(/([А-ЯІЇЄа-яіїє\s\-]+)\s*[–—-]\s*([А-ЯІЇЄа-яіїє\s\-]+)\s*<br/);
  const routeTitle = routeMatch ? `${routeMatch[1].trim()} — ${routeMatch[2].trim()}` : '';

  // Парсимо рядки таблиці: станція + прибуття + відправлення
  const stations = [];
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const row = match[1];
    const cells = [];
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
    let cell;
    while ((cell = cellRegex.exec(row)) !== null) {
      // Очищаємо від тегів
      const text = cell[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      cells.push(text);
    }

    // Рядок станції має мінімум 3 клітинки: номер, назва, прибуття, відправлення
    if (cells.length >= 4) {
      const name = cells[1];
      const arr = cells[2];
      const dep = cells[3];

      // Перевіряємо що назва схожа на станцію (є літери)
      if (name && /[А-ЯІЇЄа-яіїє]{2,}/.test(name)) {
        const timeRegex = /^\d{2}:\d{2}$/;
        stations.push({
          name: name.replace(/^\d+\s*/, '').trim(), // прибираємо номер якщо є
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
