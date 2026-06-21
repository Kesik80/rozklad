/* ============================================================
   text-highlight.js
   Подключаемый модуль подсветки текста расписаний.
   Не зависит от конкретной страницы — все правила подсветки
   передаются как параметры при вызове функций.

   ФУНКЦИИ:

   1. highlightAllMarkers(text)
      Подсвечивает буквы-маркеры К, П, Б, Ф, Пн (классом .marker) —
      как стоящие сразу после времени ("08:20К"), так и отдельно.
      Список маркеров фиксированный (К, П, Б, Ф, Пн), потому что это
      общепринятые обозначения в расписаниях транспорта.

   2. highlightTimeBlack(text, times)
      Подсвечивает конкретные времена (классом .time-black).
      times — массив строк вида ["19:30", "08:00"].
      Если массив не передан — функция ничего не делает.

   3. colorText(text, colorMap)
      Подсвечивает произвольные фразы по словарю colorMap:
      { "фраза": "css-класс", ... }
      Сортирует фразы от длинных к коротким, чтобы избежать
      частичных пересечений (например "Граф.№2" раньше "№2").

   ИСПОЛЬЗОВАНИЕ НА СТРАНИЦЕ:
     <script src="text-highlight.js"></script>
     ...
     const times = ["19:30"];
     const colorMap = { "Граф.№2": "text-red", "Нд, Сб": "weekend" };

     const html = TextHighlight.highlightTimeBlack(
                    TextHighlight.colorText(
                      TextHighlight.highlightAllMarkers(rawText),
                      colorMap
                    ),
                    times
                  );

   CSS-классы (.marker, .time-black, .text-red, .text-blue,
   .text-green, .text-yellow, .weekend и т.д.) определяются
   на самой странице — модуль их не создаёт, только расставляет.
   ============================================================ */

const TextHighlight = (function () {

  /* Подсвечивает К, П, Б, Ф, Пн как отдельные слова (везде) */
  function highlightAllMarkers(text) {
    if (!text) return '';
    text = text.trim();
    if (!text) return '';

    // 1. Маркеры сразу после времени
    text = text.replace(/(\d{1,2}:\d{2})\s*([КПБФ])(?=\s|<|$)/g, '$1 <span class="marker">$2</span>');
    text = text.replace(/(\d{1,2}:\d{2})\s*(Пн)(?=\s|<|$)/g, '$1 <span class="marker">$2</span>');

    // 2. Отдельно стоящие маркеры
    text = text.replace(/(^|[^а-яА-Яіїєґ0-9])([КПБФ])(?=$|[^а-яА-Яіїєґ0-9])/g, '$1<span class="marker">$2</span>');
    text = text.replace(/(^|[^а-яА-Яіїєґ0-9])(Пн)(?=$|[^а-яА-Яіїєґ0-9])/g, '$1<span class="marker">$2</span>');

    return text;
  }

  /* Подсветка конкретных времён (например, 19:30) */
  function highlightTimeBlack(text, times) {
    if (!text) return '';
    text = text.trim();
    if (!text || !times || !times.length) return text;

    const regex = new RegExp(`\\b(${times.join('|')})\\b`, 'g');
    return text.replace(regex, '<span class="time-black">$1</span>');
  }

  /* Универсальная подсветка текста по словарю colorMap */
  function colorText(text, colorMap) {
    if (!text || !colorMap) return text;

    let result = text;
    // Сортируем по длине (длинные фразы первыми) — чтобы избежать частичных пересечений
    const phrases = Object.keys(colorMap).sort((a, b) => b.length - a.length);

    phrases.forEach(phrase => {
      if (!phrase) return;
      const className = colorMap[phrase];
      if (!className) return;

      // Экранируем спецсимволы регулярки
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      result = result.replace(regex, match => `<span class="${className}">${match}</span>`);
    });

    return result;
  }

  return { highlightAllMarkers, highlightTimeBlack, colorText };
})();
