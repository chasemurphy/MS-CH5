/* =========================================================
   Climate Page — Drawer, Thermostat Dial, Mode/Fan/Schedule
   ---------------------------------------------------------
   Join block (crosspoint-driven; SIMPL routes per room):
     Drawer:  select d901-930 | show d1641-1670 |
              active d931-960 | label s901-930
     Header title:      s961   (page title override)
     Thermostat name:   s962   (center of dial)
     Current temp (×10): a961
     Heat setpoint (×10):a962
     Cool setpoint (×10):a963
     Mode feedback  d961-964 : Heat / Cool / Auto / Off
     Fan  feedback  d965-966 : Auto / On
     Sched feedback d967-969 : Run / Hold / Away
     Heat ±         d971 / d972
     Cool ±         d973 / d974
     Mode press     d975-978
     Fan press      d979-980
     Sched press    d981-983
   ========================================================= */
(function () {
  'use strict';

  /* ---- State ---- */
  var state = {
    currentTempF: null,  /* decimal °F */
    heatSetF: null,
    coolSetF: null,
    activeMode: null     /* 'heat' | 'cool' | 'auto' | 'off' */
  };

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
  /* 280° sweep: start 135° (7 o'clock), end 45° (5 o'clock via top) */
  var DIAL_START = Math.PI * 0.75;   /* 135° */
  var DIAL_END   = Math.PI * 2.25;   /* 405° = 45° past start, total 270° */
  /* Use 280° to match PRD wording — push end to 2.305 rad from start */
  var DIAL_SWEEP = Math.PI * 1.555;  /* 280° */

  /* Temperature scale range for setpoint mapping on the dial */
  var TEMP_MIN = 50;
  var TEMP_MAX = 90;

  function tempToAngle(tempF) {
    var t = Math.max(TEMP_MIN, Math.min(TEMP_MAX, tempF));
    var frac = (t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
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

    /* Gold fill — start of arc to setpoint angle (prefer cool, else heat) */
    var setpoint = state.coolSetF;
    if (setpoint === null || setpoint === undefined) setpoint = state.heatSetF;
    if (setpoint !== null && setpoint !== undefined) {
      var setAngle = tempToAngle(setpoint);
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, DIAL_START, setAngle);
      ctx.stroke();

      /* Setpoint dot */
      var dotX = cx + Math.cos(setAngle) * radius;
      var dotY = cy + Math.sin(setAngle) * radius;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(dotX, dotY, lineW * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath();
      ctx.arc(dotX, dotY, lineW * 0.35, 0, Math.PI * 2);
      ctx.fill();
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

    if (current) current.textContent = state.currentTempF !== null
      ? (state.currentTempF).toFixed(0) : '--';
    if (heatEl) heatEl.textContent = state.heatSetF !== null
      ? (state.heatSetF).toFixed(0) : '--';
    if (coolEl) coolEl.textContent = state.coolSetF !== null
      ? (state.coolSetF).toFixed(0) : '--';

    /* Prefer the setpoint that matches the active mode */
    var showVal = null;
    var showLabel = 'Cool';
    if (state.activeMode === 'heat') {
      showVal = state.heatSetF; showLabel = 'Heat';
    } else if (state.activeMode === 'cool') {
      showVal = state.coolSetF; showLabel = 'Cool';
    } else if (state.activeMode === 'auto') {
      showVal = state.coolSetF; showLabel = 'Cool';
    } else if (state.activeMode === 'off') {
      showVal = null; showLabel = '—';
    } else {
      showVal = state.coolSetF; showLabel = 'Cool';
    }
    if (setpointLabel) setpointLabel.textContent = showLabel;
    if (setpointEl) setpointEl.textContent = (showVal !== null && showVal !== undefined)
      ? showVal.toFixed(0) : '--';
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
    initRoomButtons();

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
