/* =========================================================
   Home Page — tiles, status pills, greeting, scene dock
   ========================================================= */
(function () {
  'use strict';

  /* ---- Click → digital pulse helper ---- */
  function pulseDigital(join) {
    if (!window.CrComLib || !join) return;
    CrComLib.publishEvent('b', join, true);
    setTimeout(function () {
      CrComLib.publishEvent('b', join, false);
    }, 100);
  }

  /* ---- Tap visual feedback ---- */
  function attachPressFeedback(el, cls) {
    var add = function () { el.classList.add(cls); };
    var remove = function () { el.classList.remove(cls); };
    el.addEventListener('pointerdown', add);
    el.addEventListener('pointerup', remove);
    el.addEventListener('pointercancel', remove);
    el.addEventListener('pointerleave', remove);
  }

  /* ---- Wire home tiles ---- */
  function initTiles() {
    var tiles = document.querySelectorAll('#page-home .home-tile');
    for (var i = 0; i < tiles.length; i++) {
      (function (tile) {
        var clickJoin = tile.getAttribute('data-click');
        var fbJoin    = tile.getAttribute('data-fb');
        var showJoin  = tile.getAttribute('data-show');
        var subJoin   = tile.getAttribute('data-sub');
        var subEl     = tile.querySelector('.home-tile-sub');

        attachPressFeedback(tile, 'is-pressed');

        tile.addEventListener('click', function () {
          pulseDigital(clickJoin);
        });

        if (window.CrComLib) {
          if (fbJoin) {
            CrComLib.subscribeState('b', fbJoin, function (val) {
              tile.classList.toggle('is-active', val === true || val === 'true');
            });
          }
          if (showJoin) {
            CrComLib.subscribeState('b', showJoin, function (val) {
              var on = (val === true || val === 'true');
              tile.classList.toggle('hidden', !on);
            });
          }
          if (subJoin && subEl) {
            CrComLib.subscribeState('s', subJoin, function (val) {
              subEl.textContent = val || '';
            });
          }
        }
      })(tiles[i]);
    }
  }

  /* ---- Wire status strip pills ----
     Each pill is interactive:
       data-click → digital pulse on tap
       data-fb    → digital "selected" feedback (brass when high)
       data-label → serial text (drives the pill's content + visibility)
     Pill is hidden until SIMPL pushes a non-empty label. */
  function initPills() {
    var pills = document.querySelectorAll('#page-home .home-pill');
    for (var i = 0; i < pills.length; i++) {
      (function (pill) {
        var valEl     = pill.querySelector('.home-pill-text');
        var labelJoin = valEl ? valEl.getAttribute('data-label') : null;
        var clickJoin = pill.getAttribute('data-click');
        var fbJoin    = pill.getAttribute('data-fb');

        /* Hidden until a non-empty label arrives */
        pill.classList.add('hidden');

        attachPressFeedback(pill, 'is-pressed');

        pill.addEventListener('click', function () {
          pulseDigital(clickJoin);
        });

        if (!window.CrComLib) return;

        if (labelJoin && valEl) {
          CrComLib.subscribeState('s', labelJoin, function (val) {
            var text = (val || '').trim();
            valEl.textContent = text;
            pill.classList.toggle('hidden', text === '');
          });
        }

        if (fbJoin) {
          CrComLib.subscribeState('b', fbJoin, function (val) {
            pill.classList.toggle('selected', val === true || val === 'true');
          });
        }
      })(pills[i]);
    }
  }

  /* ---- Wire scene dock ---- */
  function initSceneDock() {
    var btns = document.querySelectorAll('#page-home .home-scene-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var clickJoin = btn.getAttribute('data-click');
        var fbJoin    = btn.getAttribute('data-fb');
        var labelJoin = btn.getAttribute('data-label');
        var nameEl    = btn.querySelector('.home-scene-name');

        /* Default hidden until SIMPL provides a label */
        btn.classList.add('hidden');

        attachPressFeedback(btn, 'is-pressed');

        btn.addEventListener('click', function () {
          pulseDigital(clickJoin);
        });

        if (!window.CrComLib) return;

        if (fbJoin) {
          CrComLib.subscribeState('b', fbJoin, function (val) {
            btn.classList.toggle('is-active', val === true || val === 'true');
          });
        }

        if (labelJoin && nameEl) {
          CrComLib.subscribeState('s', labelJoin, function (val) {
            var text = (val || '').trim();
            nameEl.textContent = text;
            btn.classList.toggle('hidden', text === '');
          });
        }
      })(btns[i]);
    }
  }

  /* ---- Greeting + date subtitle (local clock) ---- */
  function partOfDay(hour) {
    if (hour >= 5 && hour < 12)  return 'Good morning.';
    if (hour >= 12 && hour < 18) return 'Good afternoon.';
    return 'Good evening.';
  }

  function updateGreeting() {
    var textEl = document.getElementById('home-greeting-text');
    var dateEl = document.getElementById('home-greeting-date');
    if (!textEl || !dateEl) return;

    var now = new Date();
    textEl.textContent = partOfDay(now.getHours());

    try {
      dateEl.textContent = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      }).format(now);
    } catch (e) {
      dateEl.textContent = now.toDateString();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTiles();
    initPills();
    initSceneDock();
    updateGreeting();

    /* Refresh greeting once per minute so wording stays current
       even if the panel sits on Home for hours */
    setInterval(updateGreeting, 60 * 1000);
  });

  /* Refresh greeting when nav returns to home */
  window._homeGetTitle = function () {
    updateGreeting();
  };
})();
