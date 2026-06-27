export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tid } = req.query;
  if (!tid || !/^\d+$/.test(tid)) {
    return res.status(400).json({ error: 'Потрібен параметр tid (число)' });
  }

  const apiKey = process.env.SCRAPINGBEE_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SCRAPINGBEE_KEY не налаштований' });
  }

  const targetUrl = `https://swrailway.gov.ua/timetable/eltrain3-5/?tid=${tid}`;
  const proxyUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render_js=false`;

  let html;
  try {
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `ScrapingBee ${response.status}`, detail: errText.slice(0, 200) });
    }
    html = await response.text();
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }

  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
  return res.status(200).json(parseTimetable(html, tid));
}

function parseTimetable(html, tid) {
  // Номер поїзду
  const trainNumMatch = html.match(/>\s*(\d{4})\s*<\/td>/) || html.match(/(\d{4})\s*<\/td>/);
  let trainNum = null;
  if (trainNumMatch) trainNum = trainNumMatch[1];

  const stations = [];
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
  let m;

  while ((m = rowRegex.exec(html)) !== null) {
    const row = m[1];

    // Витягуємо всі td
    const tds = [];
    const tdRegex = /<td[^>]*>(.*?)<\/td>/gis;
    let td;
    while ((td = tdRegex.exec(row)) !== null) {
      const text = td[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      tds.push(text);
    }

    // Шукаємо рядок де є назва станції (кирилиця 2+ символи) та часи
    // Структура: [номер, ?, ?, назва, ?, прибуття|відправлення, ...]
    // або просто шукаємо td з назвою і поруч td з часами
    if (tds.length < 3) continue;

    let name = null;
    let arr = null;
    let dep = null;

    // Знаходимо індекс td з назвою станції
    for (let i = 0; i < tds.length; i++) {
      if (/^[А-ЯІЇЄа-яіїє].*[А-ЯІЇЄа-яіїє]/.test(tds[i]) && tds[i].length >= 3) {
        name = tds[i];
        // Шукаємо час в наступних td
        for (let j = i + 1; j < Math.min(i + 4, tds.length); j++) {
          const t = tds[j].trim();
          if (/^\d{2}:\d{2}$/.test(t)) {
            if (arr === null) arr = t;
            else if (dep === null) { dep = t; break; }
          } else if (t === '–' || t === '-') {
            if (arr === null) arr = null; // пропускаємо
            else { dep = null; break; }
          }
        }
        break;
      }
    }

    if (name && (arr || dep)) {
      stations.push({ name, arr, dep });
    }
  }

  return { tid, trainNum, stations };
}
