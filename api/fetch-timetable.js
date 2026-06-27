export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tid } = req.query;
  if (!tid || !/^\d+$/.test(tid)) {
    return res.status(400).json({ error: 'Потрібен параметр tid (число)' });
  }

  const apiKey = process.env.SCRAPINGBEE_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SCRAPINGBEE_KEY не налаштований' });

  const targetUrl = `https://swrailway.gov.ua/timetable/eltrain3-5/?tid=${tid}`;
  const proxyUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render_js=false`;

  let html;
  try {
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `ScrapingBee ${response.status}`, detail: errText.slice(0,200) });
    }
    html = await response.text();
  } catch(e) {
    return res.status(502).json({ error: e.message });
  }

  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
  return res.status(200).json(parseTimetable(html, tid));
}

function parseTimetable(html, tid) {
  // Номер поїзду — в тегу <b>XXXX</b>
  const trainNumMatch = html.match(/<b>(\d{4})<\/b>/);
  const trainNum = trainNumMatch ? trainNumMatch[1] : null;

  const stations = [];
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
  let m;

  while ((m = rowRegex.exec(html)) !== null) {
    const row = m[1];

    // Витягуємо всі td як чистий текст
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

    if (tds.length < 3) continue;

    // Шукаємо td з назвою станції (кирилиця, 3+ символи, не є числом чи датою)
    let name = null, arr = null, dep = null;

    for (let i = 0; i < tds.length; i++) {
      const t = tds[i];
      if (
        /[А-ЯІЇЄа-яіїє]{2,}/.test(t) &&
        t.length >= 3 &&
        !/^\d/.test(t) &&           // не починається з цифри
        !/^з \d/.test(t) &&         // не "з 2025-..."
        !/\d{4}-\d{2}/.test(t)      // не містить дату
      ) {
        name = t;
        // Наступні td — шукаємо два часи формату HH:MM або "–"
        for (let j = i + 1; j < Math.min(i + 5, tds.length); j++) {
          const v = tds[j].trim();
          if (/^\d{2}:\d{2}$/.test(v)) {
            if (arr === null) arr = v;
            else if (dep === null) { dep = v; break; }
          } else if (v === '–' || v === '-') {
            if (arr === null) arr = null;
            else { dep = null; break; }
          } else if (v !== '' && !/^\d+$/.test(v)) {
            // Не час і не порожньо — кінець пошуку часів
            if (arr !== null) break;
          }
        }
        break;
      }
    }

    if (name && (arr !== null || dep !== null)) {
      stations.push({ name, arr, dep });
    }
  }

  return { tid, trainNum, stations };
}
