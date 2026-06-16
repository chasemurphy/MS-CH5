/* =========================================================
   Page Navigation
   SIMPL drives all navigation via digital join feedback.
   ========================================================= */
(function () {
  'use strict';

  var pages = {
    home:      { id: 'page-home',      title: 'Home' },
    lighting:  { id: 'page-lighting',  title: 'Lighting' },
    shades:    { id: 'page-shades',    title: 'Shades' },
    climate:   { id: 'page-climate',   title: 'Climate' },
    music:     { id: 'page-music',     title: 'Music' },
    av:        { id: 'page-av',        title: 'AV' }
  };

  var currentPage = 'home';

  function updateBottomNav(name) {
    var nav = document.getElementById('bottom-nav');
    if (!nav) return;
    /* Hidden on Home, visible on every subsystem page */
    nav.classList.toggle('hidden', name === 'home');
    /* Sync selected state */
    var items = nav.querySelectorAll('.bnav-item');
    for (var i = 0; i < items.length; i++) {
      var page = items[i].getAttribute('data-page');
      items[i].classList.toggle('selected', page === name);
    }
  }

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

    /* Close shades drawer / scene panel when leaving that page */
    if (currentPage === 'shades') {
      ['shades-room-drawer', 'shades-drawer-overlay', 'shades-scene-panel'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });
    }

    /* Close climate drawer when leaving that page */
    if (currentPage === 'climate') {
      ['climate-room-drawer', 'climate-drawer-overlay'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });
    }

    /* Close AV drawers when leaving that page */
    if (currentPage === 'av') {
      ['av-room-drawer', 'av-drawer-overlay', 'av-source-panel'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });
    }

    /* Close Music drawers when leaving that page */
    if (currentPage === 'music') {
      ['music-room-drawer', 'music-drawer-overlay', 'music-media-panel', 'music-vol-drawer', 'music-vol-pill'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });
    }

    prev.classList.remove('active');
    next.classList.add('active');
    currentPage = name;

    /* Show AV volume pill only on the AV page */
    var avVol = document.getElementById('av-vol-pill');
    if (avVol) avVol.classList.toggle('hidden', name !== 'av');
    /* Show Music volume pill only on the Music page */
    var musicVol = document.getElementById('music-vol-pill');
    if (musicVol) musicVol.classList.toggle('hidden', name !== 'music');

    var homeBtn = document.getElementById('nav-home');
    if (homeBtn) {
      homeBtn.classList.toggle('hidden', name === 'home');
    }

    var setupBtn = document.getElementById('btn-setup');
    if (setupBtn) {
      setupBtn.classList.toggle('hidden', name !== 'home');
    }

    var titleEl = document.getElementById('header-title');
    if (titleEl) {
      titleEl.classList.remove('hidden');
      titleEl.textContent = pages[name].title;
      /* Let the page repaint the header with its current room name.
         Prevents other pages' serials from clobbering the title. */
      if (name === 'lighting' && window._lightingGetTitle) window._lightingGetTitle();
      if (name === 'shades'   && window._shadesGetTitle)   window._shadesGetTitle();
      if (name === 'climate'  && window._climateGetTitle)  window._climateGetTitle();
      if (name === 'music'    && window._musicGetTitle)    window._musicGetTitle();
      if (name === 'av'       && window._avGetTitle)       window._avGetTitle();
    }

    updateBottomNav(name);
  }

  /* Dev console helper: nav.go('music') */
  window.nav = { go: showPage };

  document.addEventListener('DOMContentLoaded', function () {
    /* Wire bottom-nav items: pulse on click, sync visibility from SIMPL show join */
    var navItems = document.querySelectorAll('#bottom-nav .bnav-item');
    for (var i = 0; i < navItems.length; i++) {
      (function (item) {
        var pulseJoin = item.getAttribute('data-pulse');
        var showJoin  = item.getAttribute('data-show');

        item.addEventListener('click', function () {
          if (!window.CrComLib || !pulseJoin) return;
          CrComLib.publishEvent('b', pulseJoin, true);
          setTimeout(function () {
            CrComLib.publishEvent('b', pulseJoin, false);
          }, 100);
        });

        if (window.CrComLib && showJoin) {
          CrComLib.subscribeState('b', showJoin, function (val) {
            var on = (val === true || val === 'true');
            item.classList.toggle('hidden', !on);
          });
        }
      })(navItems[i]);
    }

    /* Initial nav state */
    updateBottomNav(currentPage);

    CrComLib.subscribeState('b', '1', function (val) {
      if (val === true || val === 'true') showPage('lighting');
    });

    CrComLib.subscribeState('b', '2', function (val) {
      if (val === true || val === 'true') showPage('climate');
    });

    CrComLib.subscribeState('b', '3', function (val) {
      if (val === true || val === 'true') showPage('shades');
    });

    CrComLib.subscribeState('b', '4', function (val) {
      if (val === true || val === 'true') showPage('av');
    });

    CrComLib.subscribeState('b', '5', function (val) {
      if (val === true || val === 'true') showPage('music');
    });

    CrComLib.subscribeState('b', '200', function (val) {
      if (val === true || val === 'true') showPage('home');
    });
  });
})();
