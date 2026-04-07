/* =========================================================
   Music Page — Source Visibility
   Hides source buttons when their label is empty.
   Uses inline style.display to avoid triggering mutation
   loops (style changes don't fire childList observers).
   ========================================================= */
(function () {
  'use strict';

  function updateSourceVisibility() {
    var btns = document.querySelectorAll('#page-music .source-btn');
    for (var i = 0; i < btns.length; i++) {
      var labelSpan = btns[i].querySelector('.ch5-button--label');
      var text = labelSpan ? labelSpan.textContent.trim() : '';
      btns[i].style.display = text ? '' : 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.getElementById('page-music');
    if (!page) return;

    var observer = new MutationObserver(function () {
      updateSourceVisibility();
    });

    observer.observe(page, {
      childList: true,
      subtree: true,
      characterData: true
    });

    /* Initial check */
    updateSourceVisibility();
  });
})();
