/* =========================================================
   Lighting Page — Drawer, Scene Panel, Visibility, Room Joins
   ========================================================= */
(function () {
  'use strict';

  var currentRoomName = '';

  function updateLightingHeader() {
    var page = document.getElementById('page-lighting');
    if (!page || !page.classList.contains('active')) return;
    var titleEl = document.getElementById('header-title');
    if (titleEl) {
      titleEl.textContent = currentRoomName ? currentRoomName + ' Lighting' : 'Lighting';
    }
    updateRoomPill();
  }

  /* Floating room pill — shows current room name on phone, opens drawer on tap */
  function updateRoomPill() {
    var pill = document.getElementById('lighting-room-pill');
    if (!pill) return;
    var nameEl = pill.querySelector('.room-pill-name');
    if (nameEl) nameEl.textContent = currentRoomName || '';
  }

  window._lightingGetTitle = updateLightingHeader;

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

  /* Wire up room drawer buttons (plain divs) to CrComLib */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#lighting-room-list .drawer-room');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin = room.getAttribute('data-select');
        var showJoin   = room.getAttribute('data-show');
        var lightsJoin = room.getAttribute('data-lights');
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

        /* Loads-on count (analog) — render only when > 0 */
        if (countJoin) {
          CrComLib.subscribeState('n', countJoin, function (val) {
            var n = parseInt(val, 10) || 0;
            countEl.textContent = n > 0 ? String(n) : '';
            room.classList.toggle('has-count', n > 0);
          });
        }
      })(rooms[i]);
    }
  }

  /* Restructure each load card to match the Brass & Charcoal design:
       Row 1: [ big dial w/ center number ]   [ pill switch ]
       Row 2:   load name
       Row 3:   level % (dim when off, brass when on)
       Row 4: [ minus ] [ plus ]
     Joins:
       - The existing .load-toggle ch5-button stays in the DOM (hidden) so SIMPL
         feedback continues to flow; a custom pill switch proxies its clicks.
       - The toggle's sendEventOnClick join number is the digital on/off AND the
         analog level (same N for both — Crestron pattern in this project). */
  function initLoadCards() {
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var cards = document.querySelectorAll('#page-lighting .load-card');
    /* Ring radius is large within the 56-unit viewBox so the inner clear area
       has room for "100" with comfortable padding. */
    var ARC_RADIUS = 25;
    var ARC_CIRC = 2 * Math.PI * ARC_RADIUS;

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var toggle  = card.querySelector('.load-toggle');
        var nameEl  = card.querySelector('.load-name');
        var cardTop = card.querySelector('.card-top');
        var ctrls   = card.querySelector('.card-controls');
        if (!toggle || !nameEl || !cardTop) return;

        var join = toggle.getAttribute('sendEventOnClick');
        if (!join) return;

        /* Hide the original CH5 toggle — proxy switch handles user input */
        toggle.style.display = 'none';

        /* Build the dial */
        var wrap = card.querySelector('.load-dial-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'load-dial-wrap';

          var svg = document.createElementNS(SVG_NS, 'svg');
          svg.setAttribute('class', 'load-dial');
          svg.setAttribute('viewBox', '0 0 56 56');

          var track = document.createElementNS(SVG_NS, 'circle');
          track.setAttribute('class', 'load-dial-track');
          track.setAttribute('cx', '28');
          track.setAttribute('cy', '28');
          track.setAttribute('r', String(ARC_RADIUS));
          track.setAttribute('fill', 'none');

          var arc = document.createElementNS(SVG_NS, 'circle');
          arc.setAttribute('class', 'load-dial-arc');
          arc.setAttribute('cx', '28');
          arc.setAttribute('cy', '28');
          arc.setAttribute('r', String(ARC_RADIUS));
          arc.setAttribute('fill', 'none');
          arc.setAttribute('stroke-dasharray', '0 ' + ARC_CIRC);

          svg.appendChild(track);
          svg.appendChild(arc);
          wrap.appendChild(svg);

          var num = document.createElement('span');
          num.className = 'load-dial-num';
          num.textContent = '—';
          wrap.appendChild(num);

          card._dialArc = arc;
          card._dialNum = num;
        }

        /* Build the pill switch */
        var pill = card.querySelector('.load-switch');
        if (!pill) {
          pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'load-switch';
          pill.setAttribute('aria-label', 'Toggle');
          var thumb = document.createElement('span');
          thumb.className = 'load-switch-thumb';
          pill.appendChild(thumb);

          pill.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!window.CrComLib) return;
            CrComLib.publishEvent('b', join, true);
            setTimeout(function () {
              CrComLib.publishEvent('b', join, false);
            }, 100);
          });
        }

        /* Reorder children: dial + pill in card-top, name as its own row
           directly above the controls. The percentage line is gone — the
           dial center carries the level (or "Off" when toggled off). */
        cardTop.innerHTML = '';
        cardTop.appendChild(toggle);   /* keep hidden ch5-button alive */
        cardTop.appendChild(wrap);
        cardTop.appendChild(pill);

        /* Move name to be the last child before card-controls */
        if (nameEl.parentNode !== card || nameEl.nextElementSibling !== ctrls) {
          card.insertBefore(nameEl, ctrls);
        }

        /* Remove any legacy .load-pct from previous builds */
        var stalePct = card.querySelector('.load-pct');
        if (stalePct) stalePct.parentNode.removeChild(stalePct);

        /* --- Render helpers --- */
        function updateDial(rawVal) {
          var pct = Math.max(0, Math.min(1, (rawVal / 65535)));
          if (card._dialArc) {
            var dash = pct * ARC_CIRC;
            card._dialArc.setAttribute('stroke-dasharray', dash + ' ' + (ARC_CIRC - dash));
          }
          var on = card.classList.contains('on');
          if (card._dialNum) {
            card._dialNum.textContent = on ? Math.round(pct * 100) : 'Off';
          }
        }

        card._lastVal = 0;

        if (window.CrComLib) {
          CrComLib.subscribeState('n', join, function (val) {
            card._lastVal = parseInt(val, 10) || 0;
            updateDial(card._lastVal);
          });

          CrComLib.subscribeState('b', join, function (val) {
            var on = (val === true || val === 'true');
            card.classList.toggle('on', on);
            updateDial(card._lastVal);
          });
        }

        updateDial(0);
      })(cards[i]);
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
    /* Drawer toggle (legacy bottom-bar buttons, still wired for safety) */
    var roomToggle = document.getElementById('lighting-room-toggle');
    var overlay = document.getElementById('lighting-drawer-overlay');
    if (roomToggle) roomToggle.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    /* Floating room pill — opens drawer on phone */
    var roomPill = document.getElementById('lighting-room-pill');
    if (roomPill) roomPill.addEventListener('click', toggleDrawer);

    /* Scene panel toggle (legacy) */
    var sceneToggle = document.getElementById('lighting-scene-toggle');
    if (sceneToggle) sceneToggle.addEventListener('click', toggleScenePanel);

    /* Wire up room buttons, scene buttons, load card dials */
    initRoomButtons();
    initSceneButtons();
    initLoadCards();

    /* Update header title with current room name from s600 */
    CrComLib.subscribeState('s', '600', function (val) {
      currentRoomName = val || '';
      updateLightingHeader();
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
