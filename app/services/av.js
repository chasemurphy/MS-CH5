/* =========================================================
   AV Page — Room Drawer, Source Drawer, Subpage Switching,
             Volume / Mute / Power
   ---------------------------------------------------------
   Join block:
     Vol up / down / mute:    d97 / d98 / d99
     Volume level:            a11 (0–65535)  — feedback only
     Room names:              s21–s44
     Room select + ON fb:     d21–d44  (same join for both)
     Per-room active source:  s51–s74  (source name for room in row 21..44)
     Room power off + fb:     d50
     Active source name:      s20
     Source names:            s81–s104
     Source select + fb:      d51–d74
     Source icon (analog):    a41–a64  (0 or 99 = derive from name)
     Subpage type (SIMPL→):   d80 none | d81 DirecTV | d82 Comcast
                               d83 DVD1 | d87 AppleTV
     Trackpad (swipe/tap):    d120 up | d121 down | d122 left | d123 right
                               d124 tap/select
   ========================================================= */
(function () {
  'use strict';

  /* ---- Icon resolution ---- */
  var SOURCE_ICON_MAP = {
    1: 'fa-satellite-dish',
    2: 'fa-satellite-dish',
    3: 'fa-apple',
    4: 'fa-film',
    5: 'fa-compact-disc'
  };

  function iconForSource(name, analogValue) {
    if (analogValue && analogValue !== 99) {
      return SOURCE_ICON_MAP[analogValue] || 'fa-tv';
    }
    var n = (name || '').toLowerCase();
    if (n.indexOf('directv') !== -1)                               return 'fa-satellite-dish';
    if (n.indexOf('comcast') !== -1 || n.indexOf('xfinity') !== -1) return 'fa-satellite-dish';
    if (n.indexOf('apple') !== -1)                                 return 'fa-apple';
    if (n.indexOf('kaleidescape') !== -1)                          return 'fa-film';
    if (n.indexOf('dvd') !== -1 || n.indexOf('blu') !== -1)        return 'fa-compact-disc';
    return 'fa-tv';
  }

  /* ---- Subpage map: join → element ID ---- */
  var SUBPAGE_MAP = {
    80: 'av-sub-nocontrol',
    81: 'av-sub-sat1',
    82: 'av-sub-sat2',
    83: 'av-sub-dvd1',
    87: 'av-sub-appletv'
  };

  /* ---- Per-source state (name + analog icon value) ---- */
  var sourceNames  = {};   /* index (0-based) → name string */
  var sourceIcons  = {};   /* index (0-based) → analog value */

  /* ---- Header state ---- */
  var currentRoomName   = '';
  var currentSourceName = '';
  var roomNamesMap      = {};   /* selectJoin string → room name */

  function updateAVHeader() {
    var page    = document.getElementById('page-av');
    if (!page || !page.classList.contains('active')) return;
    var roomEl = document.getElementById('av-title-room');
    var srcEl  = document.getElementById('av-title-source');
    if (roomEl) roomEl.textContent = currentRoomName || 'AV';
    if (srcEl)  srcEl.textContent  = currentSourceName || '';
  }

  /* Exposed so navigation.js can refresh the AV title on page switch */
  window._avGetTitle = function () {
    updateAVHeader();
    var parts = [];
    if (currentRoomName)   parts.push(currentRoomName);
    if (currentSourceName) parts.push(currentSourceName);
    return parts.length ? parts.join(' \u2014 ') : 'AV';
  };

  /* ---- Drawers ---- */
  function openRoomDrawer() {
    document.getElementById('av-room-drawer').classList.add('open');
    document.getElementById('av-drawer-overlay').classList.add('open');
  }
  function closeRoomDrawer() {
    document.getElementById('av-room-drawer').classList.remove('open');
    document.getElementById('av-drawer-overlay').classList.remove('open');
  }
  function openSourcePanel() {
    document.getElementById('av-source-panel').classList.add('open');
    document.getElementById('av-drawer-overlay').classList.add('open');
  }
  function closeSourcePanel() {
    document.getElementById('av-source-panel').classList.remove('open');
    document.getElementById('av-drawer-overlay').classList.remove('open');
  }
  function closeAllDrawers() {
    closeRoomDrawer();
    closeSourcePanel();
    closeVolPanel();
  }

  /* ---- Volume panel (drawer on phone, rail on TSW) ---- */
  function openVolPanel() {
    var pill   = document.getElementById('av-vol-pill');
    var drawer = document.getElementById('av-vol-drawer');
    var rail   = document.getElementById('av-vol-rail');
    if (pill)   pill.classList.add('open');
    if (drawer) drawer.classList.add('open');
    if (rail)   rail.classList.add('open');
  }
  function closeVolPanel() {
    var pill   = document.getElementById('av-vol-pill');
    var drawer = document.getElementById('av-vol-drawer');
    var rail   = document.getElementById('av-vol-rail');
    if (pill)   pill.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    if (rail)   rail.classList.remove('open');
  }
  function toggleVolPanel() {
    var pill = document.getElementById('av-vol-pill');
    if (pill && pill.classList.contains('open')) closeVolPanel();
    else {
      closeRoomDrawer();
      closeSourcePanel();
      openVolPanel();
    }
  }

  /* ---- Subpage switching ---- */
  function showSubpage(join) {
    var targetId = SUBPAGE_MAP[join];
    Object.keys(SUBPAGE_MAP).forEach(function (j) {
      var el = document.getElementById(SUBPAGE_MAP[j]);
      if (el) el.classList.remove('active');
    });
    if (targetId) {
      var target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    }
  }

  function initSubpages() {
    Object.keys(SUBPAGE_MAP).forEach(function (j) {
      (function (join) {
        CrComLib.subscribeState('b', String(join), function (val) {
          if (val === true || val === 'true') showSubpage(join);
        });
      })(Number(j));
    });
  }

  /* ---- Pulse buttons (data-click) ---- */
  function initPulseButtons() {
    var btns = document.querySelectorAll('#page-av [data-click]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var join = btn.getAttribute('data-click');
        btn.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          CrComLib.publishEvent('b', join, true);
          CrComLib.publishEvent('b', join, false);
        });
      })(btns[i]);
    }
  }

  /* ---- Hold-high buttons (data-hold) ---- */
  function initHoldButtons() {
    var btns = document.querySelectorAll('#page-av [data-hold]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var join = btn.getAttribute('data-hold');
        btn.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          CrComLib.publishEvent('b', join, true);
        });
        btn.addEventListener('pointerup', function () {
          CrComLib.publishEvent('b', join, false);
        });
        btn.addEventListener('pointerleave', function () {
          CrComLib.publishEvent('b', join, false);
        });
        btn.addEventListener('pointercancel', function () {
          CrComLib.publishEvent('b', join, false);
        });
      })(btns[i]);
    }
  }

  /* ---- Room drawer ---- */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#av-room-list .drawer-room');
    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin  = room.getAttribute('data-select');
        var labelJoin   = room.getAttribute('data-label');
        var sourceLabel = room.getAttribute('data-source-label');

        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeAllDrawers, 200);
        });

        /* Same join is both the select pulse and the ON feedback */
        CrComLib.subscribeState('b', selectJoin, function (val) {
          var on = val === true || val === 'true';
          room.classList.toggle('selected', on);
          if (on) {
            currentRoomName = roomNamesMap[selectJoin] || '';
            updateAVHeader();
          }
        });

        /* Show/hide room based on whether name is non-empty */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val || '';
          room.classList.toggle('visible', !!(val && val.trim()));
          roomNamesMap[selectJoin] = val || '';
          if (room.classList.contains('selected')) {
            currentRoomName = val || '';
            updateAVHeader();
          }
        });

        /* Per-room active source label (secondary text) */
        if (sourceLabel) {
          CrComLib.subscribeState('s', sourceLabel, function (val) {
            var srcEl = room.querySelector('.drawer-room-source');
            if (!srcEl) return;
            var text = (val || '').trim();
            srcEl.textContent = text ? text : '— off —';
          });
        }
      })(rooms[i]);
    }
  }

  /* ---- Source panel ---- */
  function updateSourceButton(btn, idx) {
    var name  = sourceNames[idx] || '';
    var aval  = sourceIcons[idx] || 0;
    var label = btn.querySelector('.av-source-label');
    var icon  = btn.querySelector('.av-source-icon');

    if (label) label.textContent = name;

    if (icon) {
      /* Remove all fa- classes, re-apply resolved icon */
      icon.className = icon.className.replace(/\bfa-\S+/g, '').trim();
      icon.classList.add('fas', iconForSource(name, aval));
      /* fa-apple is a brand icon */
      if (iconForSource(name, aval) === 'fa-apple') {
        icon.classList.remove('fas');
        icon.classList.add('fab');
      }
    }

    /* Show only if name is non-empty */
    btn.classList.toggle('hidden', !name.trim());
  }

  function initSourceButtons() {
    var btns = document.querySelectorAll('#av-source-list .av-source-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn, idx) {
        var clickJoin = btn.getAttribute('data-click');
        var labelJoin = btn.getAttribute('data-label');
        var iconJoin  = btn.getAttribute('data-icon');

        btn.addEventListener('click', function () {
          CrComLib.publishEvent('b', clickJoin, true);
          CrComLib.publishEvent('b', clickJoin, false);
          setTimeout(closeAllDrawers, 200);
        });

        /* Source selected feedback */
        CrComLib.subscribeState('b', clickJoin, function (val) {
          btn.classList.toggle('selected', val === true || val === 'true');
        });

        /* Source name */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          sourceNames[idx] = val || '';
          updateSourceButton(btn, idx);
        });

        /* Icon analog override */
        CrComLib.subscribeState('n', iconJoin, function (val) {
          sourceIcons[idx] = Number(val) || 0;
          updateSourceButton(btn, idx);
        });
      })(btns[i], i);
    }
  }

  /* ---- Trackpad: swipe → directional joins, tap → select join ---- */
  function initTrackpads() {
    var pads = document.querySelectorAll('#page-av .av-trackpad');
    var SWIPE_THRESHOLD = 30;
    var MAX_TAP_TIME   = 400;

    for (var i = 0; i < pads.length; i++) {
      (function (pad) {
        var startX = 0, startY = 0, startT = 0, active = false;
        var upJ    = pad.getAttribute('data-up');
        var downJ  = pad.getAttribute('data-down');
        var leftJ  = pad.getAttribute('data-left');
        var rightJ = pad.getAttribute('data-right');
        var tapJ   = pad.getAttribute('data-tap');

        function fire(join, cls) {
          if (join) {
            CrComLib.publishEvent('b', join, true);
            CrComLib.publishEvent('b', join, false);
          }
          if (cls) {
            pad.classList.add(cls);
            setTimeout(function () { pad.classList.remove(cls); }, 250);
          }
        }

        pad.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          active = true;
          startX = e.clientX;
          startY = e.clientY;
          startT = Date.now();
          try { pad.setPointerCapture(e.pointerId); } catch (err) {}
          pad.classList.add('swiping');
        });

        pad.addEventListener('pointerup', function (e) {
          if (!active) return;
          active = false;
          pad.classList.remove('swiping');

          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          var dt = Date.now() - startT;
          var absX = Math.abs(dx), absY = Math.abs(dy);

          if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD && dt < MAX_TAP_TIME) {
            fire(tapJ, 'fire-tap');
          } else if (absX > absY) {
            if (dx > 0) fire(rightJ, 'fire-right');
            else        fire(leftJ,  'fire-left');
          } else {
            if (dy > 0) fire(downJ, 'fire-down');
            else        fire(upJ,   'fire-up');
          }
        });

        pad.addEventListener('pointercancel', function () {
          active = false;
          pad.classList.remove('swiping');
        });
      })(pads[i]);
    }
  }

  /* ---- Active source name (drives header) ---- */
  function initActiveSource() {
    CrComLib.subscribeState('s', '20', function (val) {
      currentSourceName = val || '';
      updateAVHeader();
    });
  }

  /* ---- Volume (feedback only — no analog publish from panel) ---- */
  function initVolume() {
    CrComLib.subscribeState('n', '11', function (val) {
      var n = Number(val) || 0;
      var pct = Math.round(n / 655.35);
      var txt = pct + '%';
      var ids = ['av-vol-pct', 'av-vol-drawer-pct', 'av-vol-rail-pct'];
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.textContent = txt;
      }
      var dFill = document.getElementById('av-vol-drawer-fill');
      if (dFill) dFill.style.width  = pct + '%';
      var rFill = document.getElementById('av-vol-rail-fill');
      if (rFill) rFill.style.height = pct + '%';
    });
  }

  /* ---- Mute feedback ---- */
  function initMute() {
    CrComLib.subscribeState('b', '99', function (val) {
      var on = val === true || val === 'true';
      var ids = ['av-vol-pill', 'av-vol-drawer-mute', 'av-vol-rail-mute'];
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.classList.toggle('muted', on);
      }
    });
  }

  /* ---- Power (room off) feedback ---- */
  function initPower() {
    CrComLib.subscribeState('b', '50', function (val) {
      var btn = document.getElementById('av-power-btn');
      /* d40 feedback high = room is OFF */
      if (btn) btn.classList.toggle('av-off', val === true || val === 'true');
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var roomToggle   = document.getElementById('av-room-toggle');
    var sourceToggle = document.getElementById('av-source-toggle');
    var volPill      = document.getElementById('av-vol-pill');
    var overlay      = document.getElementById('av-drawer-overlay');

    if (roomToggle)   roomToggle.addEventListener('click', function () {
      closeSourcePanel();
      closeVolPanel();
      openRoomDrawer();
    });
    if (sourceToggle) sourceToggle.addEventListener('click', function () {
      closeRoomDrawer();
      closeVolPanel();
      openSourcePanel();
    });
    if (volPill) volPill.addEventListener('click', function (e) {
      e.preventDefault();
      toggleVolPanel();
    });
    if (overlay) overlay.addEventListener('click', closeAllDrawers);

    initSubpages();
    initPulseButtons();
    initHoldButtons();
    initTrackpads();
    initRoomButtons();
    initSourceButtons();
    initActiveSource();
    initVolume();
    initMute();
    initPower();
  });

})();
