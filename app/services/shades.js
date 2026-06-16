/* =========================================================
   Shades Page — Drawer, Window Visual, Hold Controls, Counts
   ========================================================= */
(function () {
  'use strict';

  var currentRoomName = '';
  var currentRoomCount = 0;

  function updateShadesHeader() {
    var page = document.getElementById('page-shades');
    if (!page || !page.classList.contains('active')) return;
    var titleEl = document.getElementById('header-title');
    if (titleEl) {
      titleEl.textContent = currentRoomName ? currentRoomName + ' Shades' : 'Shades';
    }
    updateRoomPill();
  }

  function updateRoomPill() {
    var pill = document.getElementById('shades-room-pill');
    if (!pill) return;
    var nameEl = pill.querySelector('.room-pill-name');
    if (nameEl) nameEl.textContent = currentRoomName || '';
  }

  window._shadesGetTitle = updateShadesHeader;

  function toggleDrawer() {
    document.getElementById('shades-room-drawer').classList.toggle('open');
    document.getElementById('shades-drawer-overlay').classList.toggle('open');
  }

  function closeDrawer() {
    document.getElementById('shades-room-drawer').classList.remove('open');
    document.getElementById('shades-drawer-overlay').classList.remove('open');
  }

  function toggleScenePanel() {
    document.getElementById('shades-scene-panel').classList.toggle('open');
  }

  /* Hide shade cards whose name is empty */
  function updateShadeVisibility() {
    var cards = document.querySelectorAll('#page-shades .shade-card');
    for (var i = 0; i < cards.length; i++) {
      var nameEl = cards[i].querySelector('.shade-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      cards[i].style.display = text ? '' : 'none';
    }
  }

  function toPct(val) {
    return Math.round((val / 65535) * 100) + '%';
  }

  /* Wire shade buttons — pulse or hold pattern based on data-hold attr */
  function initShadeButtons() {
    var cards = document.querySelectorAll('#page-shades .shade-card');

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var buttons = card.querySelectorAll('.shade-btn');

        for (var j = 0; j < buttons.length; j++) {
          (function (btn) {
            var clickJoin = btn.getAttribute('data-click');
            var isHold = btn.getAttribute('data-hold') === 'true';

            if (isHold) {
              /* Raise/Lower: hold high while pressed */
              btn.addEventListener('pointerdown', function () {
                CrComLib.publishEvent('b', clickJoin, true);
              });
              btn.addEventListener('pointerup', function () {
                CrComLib.publishEvent('b', clickJoin, false);
              });
              btn.addEventListener('pointerleave', function () {
                CrComLib.publishEvent('b', clickJoin, false);
              });
            } else {
              /* Open/Close: pulse */
              btn.addEventListener('click', function () {
                CrComLib.publishEvent('b', clickJoin, true);
                CrComLib.publishEvent('b', clickJoin, false);
              });
            }
          })(buttons[j]);
        }
      })(cards[i]);
    }
  }

  /* Subscribe to analog position joins — drive the new window/fabric visual.
     SIMPL convention: 0% = fully closed (window covered), 100% = fully open.
     Fabric coverage in the visual is therefore (100 - pct). */
  function initPositionBars() {
    var cards = document.querySelectorAll('#page-shades .shade-card');

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var fabric = card.querySelector('.shade-fabric');
        var rail   = card.querySelector('.shade-rail');
        var pctEl  = card.querySelector('.shade-pct');
        var analogJoin = fabric ? fabric.getAttribute('data-analog') : null;

        if (!analogJoin) return;

        CrComLib.subscribeState('n', analogJoin, function (val) {
          var pct = (val / 65535) * 100;          /* open % (SIMPL) */
          var coverage = 100 - pct;                /* fabric % (visual) */
          if (fabric) fabric.style.height = coverage + '%';
          if (rail)   rail.style.top = coverage + '%';
          if (pctEl)  pctEl.textContent = toPct(val);
          /* Active state when shade is at least partially deployed */
          card.classList.toggle('shade-active', pct < 100);
          /* Rail glow only when partially deployed (hide at full open & full close) */
          card.classList.toggle('shade-rail-on', pct > 0 && pct < 100);
        });
      })(cards[i]);
    }
  }

  /* Subscribe to moving feedback joins — toggle animation class */
  function initMovingIndicators() {
    var cards = document.querySelectorAll('#page-shades .shade-card');

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var movingJoin = card.getAttribute('data-moving');
        if (!movingJoin) return;

        CrComLib.subscribeState('b', movingJoin, function (val) {
          card.classList.toggle('shade-moving', val === true || val === 'true');
        });
      })(cards[i]);
    }
  }

  /* Wire up room drawer buttons (mirrors lighting.js — count badge + selection) */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#shades-room-list .drawer-room');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin = room.getAttribute('data-select');
        var showJoin   = room.getAttribute('data-show');
        var shadesJoin = room.getAttribute('data-shades');
        var labelJoin  = room.getAttribute('data-label');
        var countJoin  = room.getAttribute('data-count');

        /* Insert count badge once (right side of row) */
        var countEl = room.querySelector('.drawer-room-count');
        if (!countEl) {
          countEl = document.createElement('span');
          countEl.className = 'drawer-room-count';
          countEl.textContent = '';
          room.appendChild(countEl);
        }

        /* Click → pulse digital select join */
        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeDrawer, 200);
        });

        /* Selected feedback — also drives header subtitle for currently-selected room */
        CrComLib.subscribeState('b', selectJoin, function (val) {
          var sel = (val === true || val === 'true');
          room.classList.toggle('selected', sel);
          if (sel) {
            currentRoomCount = parseInt(room._shadesCount, 10) || 0;
            updateShadesHeader();
          }
        });

        /* Visible feedback */
        CrComLib.subscribeState('b', showJoin, function (val) {
          room.classList.toggle('visible', val === true || val === 'true');
        });

        /* Shades-active indicator (gold dot) */
        CrComLib.subscribeState('b', shadesJoin, function (val) {
          room.classList.toggle('shades-active', val === true || val === 'true');
        });

        /* Room name */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val;
        });

        /* Active-shades count for this room (analog) — render badge + cache */
        if (countJoin) {
          CrComLib.subscribeState('n', countJoin, function (val) {
            var n = parseInt(val, 10) || 0;
            room._shadesCount = n;
            countEl.textContent = n > 0 ? String(n) : '';
            room.classList.toggle('has-count', n > 0);
            /* If this room is the currently-selected one, refresh header */
            if (room.classList.contains('selected')) {
              currentRoomCount = n;
              updateShadesHeader();
            }
          });
        }
      })(rooms[i]);
    }
  }

  /* Hide scene buttons whose label is empty */
  function updateSceneVisibility() {
    var btns = document.querySelectorAll('#page-shades .scene-btn');
    for (var i = 0; i < btns.length; i++) {
      var nameEl = btns[i].querySelector('.scene-btn-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      btns[i].classList.toggle('visible', !!text);
    }
  }

  /* Wire up scene buttons */
  function initSceneButtons() {
    var btns = document.querySelectorAll('#page-shades .scene-btn');

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

  /* Subscribe to shade name serials — update text in cards */
  function initShadeNames() {
    var cards = document.querySelectorAll('#page-shades .shade-card');

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var nameEl = card.querySelector('.shade-name');
        var labelJoin = nameEl ? nameEl.getAttribute('data-label') : null;
        if (!labelJoin) return;

        CrComLib.subscribeState('s', labelJoin, function (val) {
          nameEl.textContent = val;
          updateShadeVisibility();
        });
      })(cards[i]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Drawer toggle (legacy bottom-bar buttons, still wired for safety) */
    var roomToggle = document.getElementById('shades-room-toggle');
    var overlay = document.getElementById('shades-drawer-overlay');
    if (roomToggle) roomToggle.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    /* Floating room pill — opens drawer on phone */
    var roomPill = document.getElementById('shades-room-pill');
    if (roomPill) roomPill.addEventListener('click', toggleDrawer);

    /* Scene panel toggle (legacy) */
    var sceneToggle = document.getElementById('shades-scene-toggle');
    if (sceneToggle) sceneToggle.addEventListener('click', toggleScenePanel);

    /* Wire everything up */
    initShadeNames();
    initShadeButtons();
    initPositionBars();
    initMovingIndicators();
    initRoomButtons();
    initSceneButtons();

    /* Update header title with current room name from s851 */
    CrComLib.subscribeState('s', '851', function (val) {
      currentRoomName = val || '';
      updateShadesHeader();
    });

    /* Visibility observer — recheck when DOM changes (SIMPL pushes names) */
    var page = document.getElementById('page-shades');
    if (page) {
      var observer = new MutationObserver(function () {
        updateShadeVisibility();
        updateSceneVisibility();
      });
      observer.observe(page, {
        childList: true,
        subtree: true,
        characterData: true
      });
      updateShadeVisibility();
      updateSceneVisibility();
    }
  });
})();
