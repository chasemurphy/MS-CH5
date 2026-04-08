/* =========================================================
   Lighting Page — Drawer, Scene Panel, Visibility, Room Joins
   ========================================================= */
(function () {
  'use strict';

  function toggleDrawer() {
    document.getElementById('lighting-room-drawer').classList.toggle('open');
    document.getElementById('lighting-drawer-overlay').classList.toggle('open');
  }

  function closeDrawer() {
    document.getElementById('lighting-room-drawer').classList.remove('open');
    document.getElementById('lighting-drawer-overlay').classList.remove('open');
  }

  function toggleScenePanel() {
    document.getElementById('lighting-scene-panel').classList.toggle('open');
  }

  /* Hide load cards whose name is empty (same pattern as music.js) */
  function updateLoadVisibility() {
    var cards = document.querySelectorAll('#page-lighting .load-card');
    for (var i = 0; i < cards.length; i++) {
      var nameEl = cards[i].querySelector('.load-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      cards[i].style.display = text ? '' : 'none';
    }
  }

  /* Hide scene buttons whose label is empty */
  function updateSceneVisibility() {
    var btns = document.querySelectorAll('#page-lighting .scene-btn');
    for (var i = 0; i < btns.length; i++) {
      var nameEl = btns[i].querySelector('.scene-btn-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      btns[i].classList.toggle('visible', !!text);
    }
  }

  /* Update the slider's gradient fill to match its value */
  function updateSliderFill(slider) {
    var pct = (slider.value / slider.max) * 100;
    slider.style.setProperty('--val', pct + '%');
  }

  /* Wire up native range sliders to CrComLib */
  function initSliders() {
    var sliders = document.querySelectorAll('#page-lighting .load-slider');

    for (var i = 0; i < sliders.length; i++) {
      (function (slider) {
        var analogJoin = slider.getAttribute('data-analog');
        var clickJoin  = slider.getAttribute('data-click');
        var card       = slider.closest('.load-card');
        var pctEl      = card ? card.querySelector('.load-pct') : null;
        var touching = false;
        var locked = false;        /* ignore SIMPL feedback while true */
        var throttleTimer = null;
        var THROTTLE_MS = 100;     /* send at most every 100 ms */
        var SETTLE_MS = 500;       /* ignore feedback this long after release */

        function toPct(val) {
          return Math.round((val / 65535) * 100) + '%';
        }

        function updatePct(val) {
          if (pctEl) pctEl.textContent = toPct(val);
        }

        function sendAnalog() {
          CrComLib.publishEvent('n', analogJoin, parseInt(slider.value, 10));
        }

        /* Throttled send — fires immediately on first move, then at most
           once per THROTTLE_MS while finger is dragging */
        slider.addEventListener('input', function () {
          updateSliderFill(slider);
          updatePct(slider.value);   /* show local value immediately */
          if (!touching) return;
          if (!throttleTimer) {
            sendAnalog();
            throttleTimer = setTimeout(function () {
              throttleTimer = null;
            }, THROTTLE_MS);
          }
        });

        function onTouchStart() {
          touching = true;
          locked = true;
          CrComLib.publishEvent('b', clickJoin, true);
        }

        function onTouchEnd() {
          sendAnalog();           /* always send final value on release */
          touching = false;
          throttleTimer = null;
          CrComLib.publishEvent('b', clickJoin, false);
          /* Keep ignoring SIMPL feedback briefly so it doesn't snap back */
          setTimeout(function () { locked = false; }, SETTLE_MS);
        }

        /* Digital high while finger is on slider — SIMPL gates analog on this */
        slider.addEventListener('mousedown', onTouchStart);
        slider.addEventListener('mouseup', onTouchEnd);
        slider.addEventListener('touchstart', onTouchStart);
        slider.addEventListener('touchend', onTouchEnd);

        /* Receive analog from SIMPL — update visual only when not touching
           and not in post-release settle window */
        CrComLib.subscribeState('n', analogJoin, function (val) {
          if (!locked) {
            slider.value = val;
            updateSliderFill(slider);
            updatePct(val);
          }
        });

        /* Init fill */
        updateSliderFill(slider);
      })(sliders[i]);
    }
  }

  /* Wire up room drawer buttons (plain divs) to CrComLib */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#lighting-room-list .drawer-room');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin = room.getAttribute('data-select');
        var showJoin   = room.getAttribute('data-show');
        var lightsJoin = room.getAttribute('data-lights');
        var labelJoin  = room.getAttribute('data-label');

        /* Click → pulse digital select join */
        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeDrawer, 200);
        });

        /* Selected feedback */
        CrComLib.subscribeState('b', selectJoin, function (val) {
          room.classList.toggle('selected', val === true || val === 'true');
        });

        /* Visible feedback */
        CrComLib.subscribeState('b', showJoin, function (val) {
          room.classList.toggle('visible', val === true || val === 'true');
        });

        /* Lights-on indicator */
        CrComLib.subscribeState('b', lightsJoin, function (val) {
          room.classList.toggle('lights-on', val === true || val === 'true');
        });

        /* Room name */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val;
        });
      })(rooms[i]);
    }
  }

  /* Wire up scene buttons (plain divs) to CrComLib */
  function initSceneButtons() {
    var btns = document.querySelectorAll('#page-lighting .scene-btn');

    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var clickJoin = btn.getAttribute('data-click');
        var labelJoin = btn.getAttribute('data-label');

        /* Click → pulse digital join */
        btn.addEventListener('click', function () {
          CrComLib.publishEvent('b', clickJoin, true);
          CrComLib.publishEvent('b', clickJoin, false);
        });

        /* Selected feedback */
        CrComLib.subscribeState('b', clickJoin, function (val) {
          btn.classList.toggle('selected', val === true || val === 'true');
        });

        /* Scene name */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = btn.querySelector('.scene-btn-name');
          if (nameEl) nameEl.textContent = val;
          updateSceneVisibility();
        });
      })(btns[i]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Drawer toggle */
    var roomToggle = document.getElementById('lighting-room-toggle');
    var overlay = document.getElementById('lighting-drawer-overlay');
    if (roomToggle) roomToggle.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    /* Scene panel toggle */
    var sceneToggle = document.getElementById('lighting-scene-toggle');
    if (sceneToggle) sceneToggle.addEventListener('click', toggleScenePanel);

    /* Wire up room buttons, scene buttons, sliders */
    initRoomButtons();
    initSceneButtons();
    initSliders();

    /* Update header title with current room name from s600 */
    CrComLib.subscribeState('s', '600', function (val) {
      var titleEl = document.getElementById('header-title');
      if (titleEl && val) {
        titleEl.textContent = val + ' Lighting';
      }
    });

    /* Visibility observers */
    var page = document.getElementById('page-lighting');
    if (page) {
      var observer = new MutationObserver(function () {
        updateLoadVisibility();
        updateSceneVisibility();
      });
      observer.observe(page, {
        childList: true,
        subtree: true,
        characterData: true
      });
      updateLoadVisibility();
      updateSceneVisibility();
    }
  });
})();
