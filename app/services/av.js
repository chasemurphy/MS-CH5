/* =========================================================
   AV Page — Room Drawer, Source Drawer, Subpage Switching,
             Volume / Mute / Power
   ---------------------------------------------------------
   Join block:
     Vol up / down / mute:    d97 / d98 / d99
     Volume level:            a1  (0–65535; 0 = hide strip)
     Room names:              s21–s44
     Room select + ON fb:     d21–d44  (same join for both)
     Room power off + fb:     d50
     Active source name:      s20
     Source names:            s81–s104
     Source select + fb:      d51–d74
     Source icon (analog):    a41–a64  (0 or 99 = derive from name)
     Subpage type (SIMPL→):   d80 none | d81 DirecTV | d82 Comcast
                               d83 DVD1 | d87 AppleTV
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
        var selectJoin = room.getAttribute('data-select');
        var labelJoin  = room.getAttribute('data-label');

        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeAllDrawers, 200);
        });

        /* Same join is both the select pulse and the ON feedback */
        CrComLib.subscribeState('b', selectJoin, function (val) {
          room.classList.toggle('selected', val === true || val === 'true');
        });

        /* Show/hide room based on whether name is non-empty */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val || '';
          room.classList.toggle('visible', !!(val && val.trim()));
        });
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

  /* ---- Active source name in bottom bar ---- */
  function initActiveSource() {
    CrComLib.subscribeState('s', '20', function (val) {
      var el = document.getElementById('av-active-source');
      if (el) el.textContent = val || '';
    });
  }

  /* ---- Volume ---- */
  function initVolume() {
    CrComLib.subscribeState('n', '1', function (val) {
      var n = Number(val) || 0;
      var strip  = document.getElementById('av-vol-strip');
      var pctEl  = document.getElementById('av-vol-pct');

      if (strip) strip.classList.toggle('hidden', n === 0);
      if (pctEl) {
        pctEl.textContent = n === 0 ? '—' : Math.round(n / 655.35) + '%';
      }
    });
  }

  /* ---- Mute feedback ---- */
  function initMute() {
    CrComLib.subscribeState('b', '99', function (val) {
      var btn = document.getElementById('av-mute-btn');
      if (btn) btn.classList.toggle('muted', val === true || val === 'true');
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

  /* ---- Header title when AV page is active ---- */
  function initHeaderTitle() {
    /* Update title whenever active source name changes and we're on AV page */
    CrComLib.subscribeState('s', '20', function (val) {
      var page = document.getElementById('page-av');
      var titleEl = document.getElementById('header-title');
      if (titleEl && page && page.classList.contains('active')) {
        titleEl.textContent = val ? val + ' — AV' : 'AV';
      }
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var roomToggle   = document.getElementById('av-room-toggle');
    var sourceToggle = document.getElementById('av-source-toggle');
    var overlay      = document.getElementById('av-drawer-overlay');

    if (roomToggle)   roomToggle.addEventListener('click', function () {
      closeSourcePanel();
      openRoomDrawer();
    });
    if (sourceToggle) sourceToggle.addEventListener('click', function () {
      closeRoomDrawer();
      openSourcePanel();
    });
    if (overlay) overlay.addEventListener('click', closeAllDrawers);

    initSubpages();
    initPulseButtons();
    initHoldButtons();
    initRoomButtons();
    initSourceButtons();
    initActiveSource();
    initVolume();
    initMute();
    initPower();
    initHeaderTitle();
  });

})();
