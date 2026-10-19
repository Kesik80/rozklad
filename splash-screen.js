/* ============================================================
   splash-screen.js
   Проста заставка запуску: екран кольору теми з іконкою й назвою.
   Показується одразу (розмітка — перший елемент <body>), тримається
   щонайменше `minDuration` мс, потім плавно розчиняється (.3 с) і
   видаляється з DOM. Анімації й стилі лежать у app.css.

     <div id="app-splash">
       <div class="splash-content">
         <img src="/icons/icon-192x192.png" class="splash-icon" alt="">
         <div class="splash-title">РАСПИСЮЛЬКА</div>
       </div>
     </div>

   Використання:
     <script src="splash-screen.js"></script>
     <script>SplashScreen.init({ minDuration: 450 });</script>
   ============================================================ */
(function () {
  function init(opts) {
    opts = opts || {};
    var minDuration = opts.minDuration != null ? opts.minDuration : 450;  // мінімум на екрані, мс
    var fadeDuration = opts.fadeDuration != null ? opts.fadeDuration : 300; // = transition в app.css
    var el = document.getElementById('app-splash');
    if (!el) return;
    var start = Date.now();

    function reveal() {
      var wait = Math.max(0, minDuration - (Date.now() - start));
      setTimeout(function () {
        el.classList.add('out');
        setTimeout(function () { el.remove(); }, fadeDuration + 50);
      }, wait);
    }

    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal);
  }

  window.SplashScreen = { init: init };
})();
