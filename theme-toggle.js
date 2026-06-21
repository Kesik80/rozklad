/* ============================================================
   theme-toggle.js
   Подключаемый модуль управления iOS-темой (светлая/тёмная)
   с кнопкой-переключателем и автоматической подстройкой под
   системную тему устройства.

   Логика:
   - Если пользователь сам переключал тему кнопкой — выбор
     сохраняется в localStorage и используется всегда (приоритет).
   - Если пользователь тему не выбирал — страница использует
     системную тему устройства И следит за ней "вживую": если ОС
     меняет тему (например, по расписанию день/ночь), страница
     переключится сама, без перезагрузки.

   Использование:
     HTML:
       <button id="theme-toggle" class="theme-toggle">🌙</button>
     В конце body:
       <script src="theme-toggle.js"></script>
       <script>ThemeToggle.init();</script>
   ============================================================ */
(function () {
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  }

  function init() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    function currentSystemTheme() {
      return mq.matches ? 'dark' : 'light';
    }

    // начальное применение темы
    const saved = localStorage.getItem('theme');
    applyTheme(saved ? saved : currentSystemTheme());

    // если пользователь не выбирал тему вручную — следим за системной
    // темой "вживую" (срабатывает, если ОС сама переключает день/ночь)
    mq.addEventListener('change', () => {
      if (!localStorage.getItem('theme')) {
        applyTheme(currentSystemTheme());
      }
    });

    // ручной переключатель
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
      });
    }
  }

  window.ThemeToggle = { init, applyTheme };
})();
