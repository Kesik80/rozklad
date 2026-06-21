/* ============================================================
   schedule-live.js
   Подключаемый модуль "живого расписания".

   КАК ПОДКЛЮЧИТЬ НА НОВОЙ СТРАНИЦЕ:
   1. Подключить <link rel="stylesheet" href="schedule-live.css">
      и <script src="schedule-live.js"></script> (после заполнения таблицы)
   2. На каждую ячейку времени добавить атрибуты:
        data-time="HH:MM"          — обязательно, время отправления
        data-weekend="1"           — опционально, если колонка "выходного дня"
                                      (если не указан — считается будним днём)
        data-always="1"            — опционально, рейс активен КАЖДЫЙ день
                                      (полностью игнорирует будний/выходной
                                      фильтр — для маршрутов без отдельного
                                      расписания на выходные)
        data-group="any-string"    — опционально, идентификатор группы/маршрута,
                                      чтобы "ближайшее отправление" считалось
                                      отдельно для каждой колонки/направления.
                                      Можно использовать название колонки.
   3. Вызвать ScheduleLive.start() после построения таблицы.
      (Можно вызвать повторно после перестроения таблицы — он сам
       снимет старые обработчики.)

   ПРИМЕР ЯЧЕЙКИ:
     <td data-time="08:20" data-weekend="0" data-group="col-ter-t">
       <div class="cell-box">08:20</div>
     </td>

   Никаких хардкод-классов колонок модуль не использует — всё
   определяется атрибутами, поэтому один и тот же файл подходит
   для любой страницы расписания.
   ============================================================ */

const ScheduleLive = (function () {
  let intervalId = null;

  // Интерполяция цвета: t=0 → зелёный (#34c759), t=1 → красный (#ff3b30)
  function lerpColor(t) {
    const r = Math.round(0x34 + (0xff - 0x34) * t);
    const g = Math.round(0xc7 + (0x3b - 0xc7) * t);
    const b = Math.round(0x59 + (0x30 - 0x59) * t);
    return `rgb(${r},${g},${b})`;
  }

  function update(options) {
    const opts = options || {};
    const windowSec = (opts.windowMinutes || 5) * 60;
    const nextDepColor = opts.nextDepColor || 'var(--accent)';

    const now = new Date();
    const isWeekendToday = now.getDay() === 0; // воскресенье; при необходимости — передать opts.isWeekend
    const isWeekend = typeof opts.isWeekend === 'boolean' ? opts.isWeekend : isWeekendToday;
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const cells = document.querySelectorAll('[data-time]');

    // сброс
    cells.forEach(td => {
      td.classList.remove('next-dep');
      td.style.color = '';
      td.style.fontWeight = '';
    });

    // группируем активные (соответствующие текущему типу дня) ячейки по data-group
    const groups = {};
    cells.forEach(td => {
      const always = td.dataset.always === '1';
      const cellIsWeekend = td.dataset.weekend === '1';
      if (!always && cellIsWeekend !== isWeekend) return;
      const group = td.dataset.group || '__default__';
      (groups[group] = groups[group] || []).push(td);
    });

    // находим ближайшее отправление в каждой группе
    Object.values(groups).forEach(tds => {
      let minDiff = Infinity, nextTd = null;
      tds.forEach(td => {
        const [h, m] = td.dataset.time.split(':').map(Number);
        const diff = h * 3600 + m * 60 - nowSec;
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextTd = td; }
      });
      if (nextTd) nextTd.classList.add('next-dep');
    });

    // применяем цвет ко всем активным ячейкам
    cells.forEach(td => {
      const always = td.dataset.always === '1';
      const cellIsWeekend = td.dataset.weekend === '1';
      if (!always && cellIsWeekend !== isWeekend) return;

      const [h, m] = td.dataset.time.split(':').map(Number);
      const diffSec = h * 3600 + m * 60 - nowSec;

      if (diffSec > 0 && diffSec <= windowSec) {
        const t = 1 - diffSec / windowSec;
        td.style.color = lerpColor(t);
        td.style.fontWeight = '800';
      } else if (td.classList.contains('next-dep')) {
        td.style.color = nextDepColor;
      }
    });
  }

  function start(options) {
    stop();
    update(options);
    intervalId = setInterval(() => update(options), (options && options.intervalMs) || 10000);
  }

  function stop() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  return { start, stop, update };
})();
