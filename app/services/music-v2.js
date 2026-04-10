/* =========================================================
   Music Page v2 — Custom HTML (no SRL)
   Room tiles, source buttons, volume sliders, media panel.
   All wired to CrComLib via data attributes.
   ========================================================= */
(function () {
  'use strict';

  /* ---- Media Panel Toggle ---- */
  function toggleMediaPanel() {
    var panel = document.getElementById('music-v2-media-panel');
    panel.classList.toggle('open');
    var isOpen = panel.classList.contains('open');
    CrComLib.publishEvent('b', '301', isOpen);
  }

  /* ---- Visibility ---- */

  /* Hide room tiles whose name text is empty */
  function updateRoomVisibility() {
    var rooms = document.querySelectorAll('#page-music-v2 .music-v2-room-col');
    for (var i = 0; i < rooms.length; i++) {
      var nameEl = rooms[i].querySelector('.music-v2-room-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      rooms[i].classList.toggle('visible', !!text);
    }
  }

  /* Hide source buttons whose label text is empty */
  function updateSourceVisibility() {
    var btns = document.querySelectorAll('#page-music-v2 .music-v2-src-btn');
    for (var i = 0; i < btns.length; i++) {
      var nameEl = btns[i].querySelector('.music-v2-src-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      btns[i].classList.toggle('visible', !!text);
    }
  }

  /* ---- Slider Fill ---- */
  function updateSliderFill(slider) {
    var pct = (slider.value / slider.max) * 100;
    slider.style.setProperty('--val', pct + '%');
  }

  /* ---- Init: Volume Sliders (native range inputs) ---- */
  function initSliders() {
    var sliders = document.querySelectorAll('#page-music-v2 .music-v2-slider');

    for (var i = 0; i < sliders.length; i++) {
      (function (slider) {
        var analogJoin = slider.getAttribute('data-analog');
        var clickJoin  = slider.getAttribute('data-click');
        var col        = slider.closest('.music-v2-room-col');
        var pctEl      = col ? col.querySelector('.music-v2-vol-pct') : null;
        var touching = false;
        var locked = false;
        var throttleTimer = null;
        var THROTTLE_MS = 100;
        var SETTLE_MS = 500;

        function toPct(val) {
          return Math.round((val / 65535) * 100) + '%';
        }

        function updatePct(val) {
          if (pctEl) pctEl.textContent = toPct(val);
        }

        function sendAnalog() {
          CrComLib.publishEvent('n', analogJoin, parseInt(slider.value, 10));
        }

        /* Throttled send during drag */
        slider.addEventListener('input', function () {
          updateSliderFill(slider);
          updatePct(slider.value);
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
          sendAnalog();
          touching = false;
          throttleTimer = null;
          CrComLib.publishEvent('b', clickJoin, false);
          setTimeout(function () { locked = false; }, SETTLE_MS);
        }

        slider.addEventListener('mousedown', onTouchStart);
        slider.addEventListener('mouseup', onTouchEnd);
        slider.addEventListener('touchstart', onTouchStart);
        slider.addEventListener('touchend', onTouchEnd);

        /* Receive analog from SIMPL */
        CrComLib.subscribeState('n', analogJoin, function (val) {
          if (!locked) {
            slider.value = val;
            updateSliderFill(slider);
            updatePct(val);
          }
        });

        updateSliderFill(slider);
      })(sliders[i]);
    }
  }

  /* ---- Init: Room Tiles ---- */
  function initRoomTiles() {
    var rooms = document.querySelectorAll('#page-music-v2 .music-v2-room-col');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var labelJoin = room.getAttribute('data-label');

        /* Room name from serial join */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.music-v2-room-name');
          if (nameEl) nameEl.textContent = val;
          updateRoomVisibility();
        });
      })(rooms[i]);
    }
  }

  /* ---- Init: Source Buttons ---- */
  function initSourceButtons() {
    var btns = document.querySelectorAll('#page-music-v2 .music-v2-src-btn');

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

        /* Source name from serial join */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = btn.querySelector('.music-v2-src-name');
          if (nameEl) nameEl.textContent = val;
          updateSourceVisibility();
        });
      })(btns[i]);
    }
  }

  /* ---- Init: Off Buttons (pulse + selected feedback) ---- */
  function initOffButtons() {
    var btns = document.querySelectorAll('#page-music-v2 .music-v2-off-btn');

    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var clickJoin = btn.getAttribute('data-click');

        btn.addEventListener('click', function () {
          CrComLib.publishEvent('b', clickJoin, true);
          CrComLib.publishEvent('b', clickJoin, false);
        });

        CrComLib.subscribeState('b', clickJoin, function (val) {
          btn.classList.toggle('selected', val === true || val === 'true');
        });
      })(btns[i]);
    }
  }

  /* ---- Init: Volume Buttons (press-and-hold) ---- */
  function initVolumeButtons() {
    var btns = document.querySelectorAll('#page-music-v2 .music-v2-vol-btn');

    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var pressJoin = btn.getAttribute('data-press');

        function onDown(e) {
          e.preventDefault();
          btn.classList.add('pressed');
          CrComLib.publishEvent('b', pressJoin, true);
        }

        function onUp() {
          btn.classList.remove('pressed');
          CrComLib.publishEvent('b', pressJoin, false);
        }

        btn.addEventListener('pointerdown', onDown);
        btn.addEventListener('pointerup', onUp);
        btn.addEventListener('pointerleave', onUp);
        btn.addEventListener('pointercancel', onUp);
      })(btns[i]);
    }
  }

  /* ---- DOMContentLoaded ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.getElementById('page-music-v2');
    if (!page) return;

    /* Bottom bar: All Off */
    var allOff = document.getElementById('music-v2-all-off');
    if (allOff) {
      allOff.addEventListener('click', function () {
        CrComLib.publishEvent('b', '400', true);
        CrComLib.publishEvent('b', '400', false);
      });
    }

    /* Bottom bar: Media toggle */
    var mediaToggle = document.getElementById('music-v2-media-toggle');
    if (mediaToggle) {
      mediaToggle.addEventListener('click', toggleMediaPanel);
    }

    /* Style media player — cream/gold theme applied directly on element */
    function styleMediaPlayer() {
      var mp = document.getElementById('media-player-v2');
      if (!mp) return;
      var vars = {
        '--ch5-media-player--background-color': 'var(--surface-primary)',
        '--ch5-media-player--default-icon-color': 'var(--text)',
        '--ch5-media-player--now-playing-icon-color': 'var(--text)',
        '--ch5-media-player--header-icon-color': 'var(--text)',
        '--ch5-media-player--default-mp-back-icon-color': 'var(--text)',
        '--ch5-media-player--my-music-menu-icon-color': 'var(--accent)',
        '--ch5-media-player--active-icon-color': '#ffffff',
        '--ch5-media-player--active-icon-background-color': 'var(--accent)',
        '--ch5-media-player--icon-button-pressed-background-color': 'var(--surface-secondary)',
        '--ch5-media-player--header-icon-background-color': 'var(--surface-secondary)',
        '--ch5-media-player--primary-font-color': 'var(--text)',
        '--ch5-media-player--secondary-font-color': 'var(--text-muted, var(--icon-muted))',
        '--ch5-media-player--default-header-text-color': 'var(--text)',
        '--ch5-media-player--default-track-info-text-color': 'var(--text)',
        '--ch5-media-player--default-provider-text-color': 'var(--text-muted, var(--icon-muted))',
        '--ch5-media-player--default-progressbar-time-color': 'var(--text-muted, var(--icon-muted))',
        '--ch5-media-player--progressbar-background-color': 'var(--surface-secondary)',
        '--ch5-media-player--progressbar-track-color': 'var(--accent)',
        '--ch5-media-player--default-progressbar-color': 'var(--surface-secondary)',
        '--ch5-media-player--loading-indicator-color': 'var(--accent)',
        '--ch5-media-player--player-name-background-color': 'var(--surface-secondary)',
        '--ch5-media-player--border-color': 'var(--border-accent)',
        '--ch5-media-player--default-border-color': 'var(--border-accent)',
        '--ch5-media-player--menu-items-border-color': 'var(--border-accent)',
        '--ch5-media-player--default-menu-items-border-color': 'var(--border-accent)',
        '--ch5-media-player--active-menu-list-item-background-color': 'rgba(var(--accent-rgb), 0.1)',
        '--ch5-media-player--default-album-art-placeholder-color': 'var(--surface-secondary)',
        '--ch5-media-player--popup-font-color': 'var(--text)',
        '--ch5-media-player--popup-border-color': 'var(--border-accent)',
        '--ch5-media-player--popup-overlay-background-color': 'rgba(0, 0, 0, 0.5)',
        '--ch5-media-player--popup-active-button-background-color': 'var(--accent)',
        '--ch5-media-player--popup-active-button-color': '#ffffff',
        '--ch5-media-player--popup-input-border-color': 'var(--border-accent)'
      };
      for (var k in vars) {
        mp.style.setProperty(k, vars[k]);
      }
    }
    styleMediaPlayer();

    /* Wire up all components */
    initRoomTiles();
    initSourceButtons();
    initOffButtons();
    initVolumeButtons();
    initSliders();

    /* Update header title with current room name from s400 */
    CrComLib.subscribeState('s', '400', function (val) {
      var titleEl = document.getElementById('header-title');
      if (titleEl && val) {
        titleEl.textContent = val;
      }
    });

    /* Visibility observers — catch text content changes from CrComLib */
    var observer = new MutationObserver(function () {
      updateRoomVisibility();
      updateSourceVisibility();
    });
    observer.observe(page, {
      childList: true,
      subtree: true,
      characterData: true
    });

    updateRoomVisibility();
    updateSourceVisibility();
  });
})();
