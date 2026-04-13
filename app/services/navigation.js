/* =========================================================
   Page Navigation
   SIMPL drives all navigation via digital join feedback.
   ========================================================= */
(function () {
  'use strict';

  var pages = {
    home:     { id: 'page-home',     title: 'Home' },
    lighting: { id: 'page-lighting', title: 'Lighting' },
    music:    { id: 'page-music-v2', title: 'Music' }
  };

  var currentPage = 'home';

  function showPage(name) {
    if (name === currentPage) return;
    if (!pages[name]) return;
    var prev = document.getElementById(pages[currentPage].id);
    var next = document.getElementById(pages[name].id);
    if (!prev || !next) return;

    /* Close lighting drawer / scene panel when leaving that page */
    if (currentPage === 'lighting') {
      ['lighting-room-drawer', 'lighting-drawer-overlay', 'lighting-scene-panel'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });
    }

    prev.classList.remove('active');
    next.classList.add('active');
    currentPage = name;

    var homeBtn = document.getElementById('nav-home');
    if (homeBtn) {
      homeBtn.classList.toggle('hidden', name === 'home');
    }

    var titleEl = document.getElementById('header-title');
    if (titleEl) {
      titleEl.textContent = pages[name].title;
    }
  }

  /* Dev console helper: nav.go('music') */
  window.nav = { go: showPage };

  document.addEventListener('DOMContentLoaded', function () {
    CrComLib.subscribeState('b', '1', function (val) {
      if (val === true || val === 'true') showPage('lighting');
    });

    CrComLib.subscribeState('b', '5', function (val) {
      if (val === true || val === 'true') showPage('music');
    });

    CrComLib.subscribeState('b', '200', function (val) {
      if (val === true || val === 'true') showPage('home');
    });
  });
})();
