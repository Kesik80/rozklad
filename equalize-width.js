/* ============================================================
   equalize-width.js
   Утилита: делает группу элементов одной ширины — по самому
   широкому из них (измеряется их реальный контент). Полезно для
   подписей/кнопок разной длины, которые должны быть выровнены
   в единую "колонку" независимо от длины текста.

   Работает с любым числом элементов и любым текстом — при
   добавлении нового элемента с более длинным текстом достаточно
   просто повторно вызвать apply(), пересчёт ширины произойдёт
   автоматически.

   Использование:
     <script src="equalize-width.js"></script>
     <script>
       EqualizeWidth.apply('.menu .label');           // по селектору
       // или
       EqualizeWidth.apply(document.querySelectorAll('.label'));
     </script>
   ============================================================ */
(function () {
  function apply(selectorOrElements) {
    const els = typeof selectorOrElements === 'string'
      ? document.querySelectorAll(selectorOrElements)
      : selectorOrElements;
    if (!els || !els.length) return 0;

    // сбрасываем ширину, чтобы измерить настоящий размер контента
    els.forEach(el => { el.style.width = 'auto'; });

    let max = 0;
    els.forEach(el => { max = Math.max(max, el.getBoundingClientRect().width); });

    els.forEach(el => { el.style.width = max + 'px'; });
    return max;
  }

  window.EqualizeWidth = { apply };
})();
