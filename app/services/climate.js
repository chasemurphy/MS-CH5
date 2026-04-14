/* =========================================================
   Climate Page — Drawer, Thermostat Dial, Mode/Fan/Schedule
   ---------------------------------------------------------
   Join block (crosspoint-driven; SIMPL routes per room):
     Drawer:  select d901-930 | show d1641-1670 |
              active d931-960 | label s901-930
     Header title:      s961   (page title override)
     Thermostat name:   s962   (center of dial)
     Current temp (×10):    n961
     Heat setpoint (×10):   n962
     Cool setpoint (×10):   n963
     Setpoint min (×10):    n964
     Setpoint max (×10):    n965
     Single-Auto SP (×10):  n966
     Mode (press+fb)    d961-964 : Heat / Cool / Auto / Off
     Fan  (press+fb)    d965-966 : Auto / On
     Sched (press+fb)   d967-969 : Run / Hold / Away
     Auto mode visible      d970  (← SIMPL)
     Heat ±                 d971 / d972
     Cool ±                 d973 / d974
     Show single setpoint   d975  (← SIMPL)
     Show dual setpoint     d976  (← SIMPL)
     Single-Auto SP ±       d977 / d978
   ========================================================= */
(function () {
  'use strict';

  /* ---- State ---- */
  var state = {
    currentTempF: null,  /* decimal °F */
    heatSetF: null,
    coolSetF: null,
    singleSetF: null,    /* Single-Auto setpoint */
    minSetF: null,       /* thermostat-reported setpoint minimum */
    maxSetF: null,       /* thermostat-reported setpoint maximum */
    activeMode: null,    /* 'heat' | 'cool' | 'auto' | 'off' */
    showSingle: false,
    showDual: false
  };

  /* Fallback scale when the thermostat hasn't reported min/max yet */
  var FALLBACK_MIN = 50;
  var FALLBACK_MAX = 90;

  /* ---- Drawer ---- */
  function toggleDrawer() {
    document.getElementById('climate-room-drawer').classList.toggle('open');
    document.getElementById('climate-drawer-overlay').classList.toggle('open');
  }
  function closeDrawer() {
    document.getElementById('climate-room-drawer').classList.remove('open');
    document.getElementById('climate-drawer-overlay').classList.remove('open');
  }

  /* ---- Helpers ---- */
  function fmtTemp(valTenths) {
    if (valTenths === null || valTenths === undefined) return '--';
    var n = Number(valTenths);
    if (isNaN(n)) return '--';
    return (n / 10).toFixed(0);
  }

  function getAccentColor() {
    var css = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim();
    return css || '#c9a84c';
  }
  function getDialTrackColor() {
    var css = getComputedStyle(document.documentElement)
      .getPropertyValue('--chrome-surface').trim();
    return css || '#2a2a2a';
  }

  /* ---- Arc Dial ---- */
  /* 270° sweep, symmetric about vertical: start 135° (7:30), end 45° (4:30) */
  var DIAL_START = Math.PI * 0.75;   /* 135° */
  var DIAL_SWEEP = Math.PI * 1.5;    /* 270° */

  function tempToAngle(tempF) {
    var min = (state.minSetF !== null) ? state.minSetF : FALLBACK_MIN;
    var max = (state.maxSetF !== null) ? state.maxSetF : FALLBACK_MAX;
    if (max <= min) { min = FALLBACK_MIN; max = FALLBACK_MAX; }
    var t = Math.max(min, Math.min(max, tempF));
    var frac = (t - min) / (max - min);
    return DIAL_START + DIAL_SWEEP * frac;
  }

  function drawDial() {
    var canvas = document.getElementById('climate-dial');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Handle DPR for crisp rendering */
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || canvas.width;
    var cssH = canvas.clientHeight || canvas.height;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var cx = cssW / 2;
    var cy = cssH * 0.58;
    var radius = Math.min(cssW, cssH) * 0.42;
    var lineW = Math.max(10, radius * 0.11);

    var accent = getAccentColor();
    var track = getDialTrackColor();

    /* Track */
    ctx.lineCap = 'round';
    ctx.lineWidth = lineW;
    ctx.strokeStyle = track;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, DIAL_START, DIAL_START + DIAL_SWEEP);
    ctx.stroke();

    /* Gold fill — arc range and setpoint dot(s) depend on mode/visibility.
       Dual  → fill between heat and cool, dot at each end.
       Single (auto) → fill start→singleSet, dot at singleSet.
       Heat-only → fill start→heatSet, dot at heatSet.
       Cool-only → fill start→coolSet, dot at coolSet. */
    function drawDot(ang) {
      var dotX = cx + Math.cos(ang) * radius;
      var dotY = cy + Math.sin(ang) * radius;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(dotX, dotY, lineW * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath();
      ctx.arc(dotX, dotY, lineW * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = accent;

    if (state.showDual && state.heatSetF !== null && state.coolSetF !== null) {
      var heatA = tempToAngle(state.heatSetF);
      var coolA = tempToAngle(state.coolSetF);
      var a1 = Math.min(heatA, coolA);
      var a2 = Math.max(heatA, coolA);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, a1, a2);
      ctx.stroke();
      drawDot(heatA);
      drawDot(coolA);
    } else if (state.showSingle && state.singleSetF !== null) {
      var sA = tempToAngle(state.singleSetF);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, DIAL_START, sA);
      ctx.stroke();
      drawDot(sA);
    } else if (state.activeMode === 'heat' && state.heatSetF !== null) {
      var hA = tempToAngle(state.heatSetF);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, DIAL_START, hA);
      ctx.stroke();
      drawDot(hA);
    } else if (state.activeMode === 'cool' && state.coolSetF !== null) {
      var cA = tempToAngle(state.coolSetF);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, DIAL_START, cA);
      ctx.stroke();
      drawDot(cA);
    }

    /* Current temp marker (thin perpendicular tick) */
    if (state.currentTempF !== null && state.currentTempF !== undefined) {
      var curAngle = tempToAngle(state.currentTempF);
      var tickInner = radius - lineW * 0.7;
      var tickOuter = radius + lineW * 0.7;
      var x1 = cx + Math.cos(curAngle) * tickInner;
      var y1 = cy + Math.sin(curAngle) * tickInner;
      var x2 = cx + Math.cos(curAngle) * tickOuter;
      var y2 = cy + Math.sin(curAngle) * tickOuter;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  /* ---- DOM readouts ---- */
  function updateReadouts() {
    var current = document.getElementById('climate-current');
    var setpointEl = document.getElementById('climate-setpoint');
    var setpointLabel = document.getElementById('climate-setpoint-label');
    var heatEl = document.getElementById('climate-heat-value');
    var coolEl = document.getElementById('climate-cool-value');
    var singleEl = document.getElementById('climate-single-value');

    if (current) current.textContent = state.currentTempF !== null
      ? (state.currentTempF).toFixed(0) : '--';
    if (heatEl) heatEl.textContent = state.heatSetF !== null
      ? (state.heatSetF).toFixed(0) : '--';
    if (coolEl) coolEl.textContent = state.coolSetF !== null
      ? (state.coolSetF).toFixed(0) : '--';
    if (singleEl) singleEl.textContent = state.singleSetF !== null
      ? (state.singleSetF).toFixed(0) : '--';

    /* Dial-center setpoint summary */
    var showVal = null;
    var showLabel = '—';
    if (state.showDual && state.coolSetF !== null && state.heatSetF !== null) {
      showLabel = 'Heat / Cool';
      showVal = state.heatSetF.toFixed(0) + ' / ' + state.coolSetF.toFixed(0);
    } else if (state.showSingle && state.singleSetF !== null) {
      showLabel = 'Set'; showVal = state.singleSetF.toFixed(0);
    } else if (state.activeMode === 'heat' && state.heatSetF !== null) {
      showLabel = 'Heat'; showVal = state.heatSetF.toFixed(0);
    } else if (state.activeMode === 'cool' && state.coolSetF !== null) {
      showLabel = 'Cool'; showVal = state.coolSetF.toFixed(0);
    } else if (state.activeMode === 'off') {
      showLabel = '—'; showVal = null;
    }
    if (setpointLabel) setpointLabel.textContent = showLabel;
    if (setpointEl) setpointEl.textContent = (showVal !== null) ? showVal : '--';
  }

  /* ---- Setpoint row + Auto-button visibility ---- */
  function updateSetpointVisibility() {
    var card = document.getElementById('climate-setpoint-card');
    var heatRow = document.getElementById('climate-heat-row');
    var coolRow = document.getElementById('climate-cool-row');
    var singleRow = document.getElementById('climate-single-row');
    if (!card) return;

    if (state.showDual) {
      card.style.display = '';
      if (heatRow) heatRow.style.display = '';
      if (coolRow) coolRow.style.display = '';
      if (singleRow) singleRow.style.display = 'none';
    } else if (state.showSingle) {
      card.style.display = '';
      if (heatRow) heatRow.style.display = 'none';
      if (coolRow) coolRow.style.display = 'none';
      if (singleRow) singleRow.style.display = '';
    } else {
      card.style.display = 'none';
    }
  }

  /* ---- Analog subscriptions ---- */
  function initTemps() {
    CrComLib.subscribeState('n', '961', function (val) {
      state.currentTempF = Number(val) / 10;
      updateReadouts();
      drawDial();
    });
    CrComLib.subscribeState('n', '962', function (val) {
      state.heatSetF = Number(val) / 10;
      updateReadouts();
      drawDial();
    });
    CrComLib.subscribeState('n', '963', function (val) {
      state.coolSetF = Number(val) / 10;
      updateReadouts();
      drawDial();
    });
    CrComLib.subscribeState('n', '964', function (val) {
      state.minSetF = Number(val) / 10;
      drawDial();
    });
    CrComLib.subscribeState('n', '965', function (val) {
      state.maxSetF = Number(val) / 10;
      drawDial();
    });
    CrComLib.subscribeState('n', '966', function (val) {
      state.singleSetF = Number(val) / 10;
      updateReadouts();
      drawDial();
    });
  }

  /* ---- Visibility subscriptions ---- */
  function initVisibility() {
    /* d970 — Auto mode button show/hide */
    CrComLib.subscribeState('b', '970', function (val) {
      var visible = (val === true || val === 'true');
      var autoBtn = document.getElementById('climate-mode-auto');
      if (autoBtn) autoBtn.style.display = visible ? '' : 'none';
    });
    /* d975 — Show single setpoint row */
    CrComLib.subscribeState('b', '975', function (val) {
      state.showSingle = (val === true || val === 'true');
      updateSetpointVisibility();
      updateReadouts();
      drawDial();
    });
    /* d976 — Show dual setpoint rows */
    CrComLib.subscribeState('b', '976', function (val) {
      state.showDual = (val === true || val === 'true');
      updateSetpointVisibility();
      updateReadouts();
      drawDial();
    });
  }

  /* ---- Mode / fan / schedule feedback + presses ---- */
  function initStateButtons() {
    var buttons = document.querySelectorAll('#page-climate .climate-btn');

    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var clickJoin = btn.getAttribute('data-click');
        var fbJoin    = btn.getAttribute('data-fb');

        if (clickJoin) {
          btn.addEventListener('click', function () {
            CrComLib.publishEvent('b', clickJoin, true);
            CrComLib.publishEvent('b', clickJoin, false);
          });
        }

        if (fbJoin) {
          CrComLib.subscribeState('b', fbJoin, function (val) {
            var active = (val === true || val === 'true');
            btn.classList.toggle('active', active);

            /* Track active mode for readout label */
            if (btn.classList.contains('climate-mode-btn') && active) {
              if (fbJoin === '961') state.activeMode = 'heat';
              else if (fbJoin === '962') state.activeMode = 'cool';
              else if (fbJoin === '963') state.activeMode = 'auto';
              else if (fbJoin === '964') state.activeMode = 'off';
              updateReadouts();
              drawDial();
            }
          });
        }
      })(buttons[i]);
    }
  }

  /* ---- Thermostat name serial ---- */
  function initTstatName() {
    CrComLib.subscribeState('s', '962', function (val) {
      var el = document.getElementById('climate-tstat-name');
      if (el) el.textContent = val || '';
    });
  }

  /* ---- Room drawer (matches shades pattern) ---- */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#climate-room-list .drawer-room');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin  = room.getAttribute('data-select');
        var showJoin    = room.getAttribute('data-show');
        var climateJoin = room.getAttribute('data-climate');
        var labelJoin   = room.getAttribute('data-label');

        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeDrawer, 200);
        });

        CrComLib.subscribeState('b', selectJoin, function (val) {
          room.classList.toggle('selected', val === true || val === 'true');
        });
        CrComLib.subscribeState('b', showJoin, function (val) {
          room.classList.toggle('visible', val === true || val === 'true');
        });
        CrComLib.subscribeState('b', climateJoin, function (val) {
          room.classList.toggle('climate-active', val === true || val === 'true');
        });
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val || '';
        });
      })(rooms[i]);
    }
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var roomToggle = document.getElementById('climate-room-toggle');
    var overlay = document.getElementById('climate-drawer-overlay');
    if (roomToggle) roomToggle.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    initTstatName();
    initTemps();
    initStateButtons();
    initVisibility();
    initRoomButtons();
    updateSetpointVisibility();

    /* Header title override when climate page active */
    CrComLib.subscribeState('s', '961', function (val) {
      var titleEl = document.getElementById('header-title');
      var page = document.getElementById('page-climate');
      if (titleEl && page && page.classList.contains('active') && val) {
        titleEl.textContent = val + ' Climate';
      }
    });

    /* Initial paint + redraw on resize / theme change */
    drawDial();
    window.addEventListener('resize', drawDial);

    /* Theme swap recolors the dial */
    var themeObserver = new MutationObserver(drawDial);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  });
})();
