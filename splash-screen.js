/* ============================================================
   splash-screen.js
   Анимированная заставка запуска в 3 фазы:
   1. Две панели спускаются сверху и сходятся по центру, закрывая
      весь экран (CSS-анимация, запускается сама при появлении
      разметки — JS тут не нужен).
   2. Как только панели сомкнулись — на них плавно проявляется
      иконка + название приложения. Показывается минимум
      `minDuration` мс (даже если страница уже загрузилась раньше) —
      чтобы заставка не "мигала" на быстром интернете.
   3. Иконка гаснет, панели разъезжаются в стороны (влево/вправо),
      открывая приложение, после чего заставка удаляется из DOM.

   HTML должен быть первым элементом в <body>:

     <div id="app-splash">
       <div class="curtain curtain-left"></div>
       <div class="curtain curtain-right"></div>
       <div class="splash-content">
         <img src="/icons/icon-192x192.png" class="splash-icon" alt="">
         <div class="splash-title">Розклад</div>
       </div>
     </div>

   CSS-анимации (curtainDown/curtainLeftOut/curtainRightOut) и их
   длительности лежат в самой странице — см. готовый пример в любом
   из файлов проекта. Длительности ниже (closeDuration/partDuration)
   должны совпадать с длительностями в CSS.

   Использование:
     <script src="splash-screen.js"></script>
     <script>SplashScreen.init({ minDuration: 700 });</script>
   ============================================================ */
(function () {
  function init(opts) {
    opts = opts || {};
    // сколько мс держим иконку на экране (после смыкания панелей),
    // даже если страница загрузилась быстрее
    const minDuration = opts.minDuration != null ? opts.minDuration : 700;
    // должны совпадать с длительностями CSS-анимаций на странице
    const closeDuration = opts.closeDuration != null ? opts.closeDuration : 500;
    const partDuration = opts.partDuration != null ? opts.partDuration : 550;

    const el = document.getElementById('app-splash');
    if (!el) return;
    const left = el.querySelector('.curtain-left');
    const right = el.querySelector('.curtain-right');
    const content = el.querySelector('.splash-content');

    const start = Date.now();

    // иконка появляется только после того, как панели сомкнулись
    setTimeout(() => { if (content) content.classList.add('show'); }, closeDuration);

    function reveal() {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, closeDuration + minDuration - elapsed);
      setTimeout(() => {
        if (content) content.classList.remove('show');
        setTimeout(() => {
          if (left) left.classList.add('part');
          if (right) right.classList.add('part');
          setTimeout(() => el.remove(), partDuration);
        }, 220); // время затухания иконки перед тем, как панели разъедутся
      }, wait);
    }

    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal);
  }

  window.SplashScreen = { init };
})();
