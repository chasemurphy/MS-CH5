/* =========================================================
   Climate Page — Drawer, Thermostat Dial, Mode/Fan/Schedule
   ---------------------------------------------------------
   Join block (crosspoint-driven; SIMPL routes per room):
     Drawer:  select d901-930 | show d1641-1670 |
              active d931-960 | label s901-930  |
              per-zone temp n931-960 (raw °F or ×10 tenths)
     Header title:      s961   (page title override)
     Thermostat name:   s962   (center of dial)
     Current temp (×10):    n961
     Heat setpoint (×10):   n962
     Cool setpoint (×10):   n963
     Setpoint min (×10):    n964
     Setpoint max (×10):    n965
     Single-Auto SP (×10):  n966
     Humidity (raw %):      n967  (hides row when 0/empty)
     Mode (press+fb)    d961-964 : Heat / Cool / Auto / Off
     Fan  (press+fb)    d965-966 : Auto / On
     Sched (press+fb)   d967-969 : Run / Hold / Away
     Auto mode visible      d970  (← SIMPL)
     Heat ±                 d971 / d972
     Cool ±                 d973 / d974
     Show single setpoint   d975  (← SIMPL)
     Show dual setpoint     d976  (← SIMPL)
     Single-Auto SP ±       d977 / d978
   Outdoor temp comes from weather.js (Open-Meteo) via the
   `weather:update` window event — no SIMPL join.
   ========================================================= */
(function () {
  'use strict';

  /* Mode-specific accent colors — pulled from CSS custom properties so the
     dark/light themes can override them via :root and html[data-theme="dark"]. */
  function readVar(name, fallback) {
    var css = getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
    return css || fallback;
  }
  function HEAT() { return readVar('--climate-heat', '#E08040'); }
  function COOL() { return readVar('--climate-cool', '#6FA0E6'); }

  var currentRoomName = '';

  function updateClimateHeader() {
    var page = document.getElementById('page-climate');
    if (!page || !page.classList.contains('active')) return;
    var titleEl = document.getElementById('header-title');
    if (!titleEl) return;
    titleEl.textContent = currentRoomName ? currentRoomName + ' Climate' : 'Climate';
  }

  /* Floating room pill — shows current room name on phone, opens drawer on tap */
  function updateRoomPill() {
    var pill = document.getElementById('climate-room-pill');
    if (!pill) return;
    var nameEl = pill.querySelector('.room-pill-name');
    if (nameEl) nameEl.textContent = currentRoomName || '';
  }

  window._climateGetTitle = updateClimateHeader;

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

  /* Mode-driven primary color for dial fill / center setpoint digits */
  function getModeColor() {
    if (state.activeMode === 'heat') return HEAT();
    if (state.activeMode === 'cool') return COOL();
    return getAccentColor();
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

    function drawDot(ang, color) {
      var dotX = cx + Math.cos(ang) * radius;
      var dotY = cy + Math.sin(ang) * radius;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dotX, dotY, lineW * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath();
      ctx.arc(dotX, dotY, lineW * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    function strokeArc(a1, a2, color) {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, a1, a2);
      ctx.stroke();
    }

    /* Dual mode → split fill: heat half (start→heat) in orange,
       cool half (cool→end) in blue. Dot colors match. */
    if (state.showDual && state.heatSetF !== null && state.coolSetF !== null) {
      var heatA = tempToAngle(state.heatSetF);
      var coolA = tempToAngle(state.coolSetF);
      strokeArc(DIAL_START, heatA, HEAT());
      strokeArc(coolA, DIAL_START + DIAL_SWEEP, COOL());
      drawDot(heatA, HEAT());
      drawDot(coolA, COOL());
    } else if (state.showSingle && state.singleSetF !== null) {
      var sA = tempToAngle(state.singleSetF);
      var sColor = getModeColor();
      strokeArc(DIAL_START, sA, sColor);
      drawDot(sA, sColor);
    } else if (state.activeMode === 'heat' && state.heatSetF !== null) {
      var hA = tempToAngle(state.heatSetF);
      strokeArc(DIAL_START, hA, HEAT());
      drawDot(hA, HEAT());
    } else if (state.activeMode === 'cool' && state.coolSetF !== null) {
      var cA = tempToAngle(state.coolSetF);
      strokeArc(DIAL_START, cA, COOL());
      drawDot(cA, COOL());
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
    var dialHeatEl = document.getElementById('climate-dial-heat-val');
    var dialCoolEl = document.getElementById('climate-dial-cool-val');
    var sensorCurrent = document.getElementById('climate-sensor-current');

    var curTxt = state.currentTempF !== null ? (state.currentTempF).toFixed(0) : '--';
    if (current) current.textContent = curTxt;
    if (sensorCurrent) sensorCurrent.textContent = curTxt + '°';

    var heatTxt = state.heatSetF !== null ? (state.heatSetF).toFixed(0) : '--';
    var coolTxt = state.coolSetF !== null ? (state.coolSetF).toFixed(0) : '--';
    var singleTxt = state.singleSetF !== null ? (state.singleSetF).toFixed(0) : '--';

    if (heatEl) heatEl.textContent = heatTxt;
    if (coolEl) coolEl.textContent = coolTxt;
    if (singleEl) singleEl.textContent = singleTxt;
    if (dialHeatEl) dialHeatEl.textContent = heatTxt;
    if (dialCoolEl) dialCoolEl.textContent = coolTxt;

    /* Single-readout (used when not dual) */
    var showVal = null;
    var showLabel = 'Set';
    var centerColor = getAccentColor();
    if (state.showSingle && state.singleSetF !== null) {
      showLabel = 'Set'; showVal = singleTxt; centerColor = getModeColor();
    } else if (state.activeMode === 'heat' && state.heatSetF !== null) {
      showLabel = 'Heat'; showVal = heatTxt; centerColor = HEAT();
    } else if (state.activeMode === 'cool' && state.coolSetF !== null) {
      showLabel = 'Cool'; showVal = coolTxt; centerColor = COOL();
    } else if (state.activeMode === 'off') {
      showLabel = 'Off'; showVal = null;
    }
    if (setpointLabel) setpointLabel.textContent = showLabel;
    if (setpointEl) {
      setpointEl.textContent = (showVal !== null) ? showVal : '--';
      setpointEl.style.color = centerColor;
    }
  }

  /* ---- Setpoint card + dial-readout visibility ---- */
  function updateSetpointVisibility() {
    var heatCard = document.getElementById('climate-heat-card');
    var coolCard = document.getElementById('climate-cool-card');
    var singleCard = document.getElementById('climate-single-card');
    var cardsWrap = document.getElementById('climate-setpoint-cards');
    var dialDual = document.getElementById('climate-dial-dual');
    var dialSingle = document.getElementById('climate-dial-single');

    function show(el, on) { if (el) el.style.display = on ? '' : 'none'; }

    if (state.showDual) {
      show(heatCard, true);
      show(coolCard, true);
      show(singleCard, false);
      show(dialDual, true);
      show(dialSingle, false);
      show(cardsWrap, true);
    } else if (state.showSingle) {
      show(heatCard, false);
      show(coolCard, false);
      show(singleCard, true);
      show(dialDual, false);
      show(dialSingle, true);
      show(cardsWrap, true);
    } else {
      /* No setpoint mode flagged — hide all cards, fall back to single readout
         in dial center driven by activeMode. */
      show(heatCard, false);
      show(coolCard, false);
      show(singleCard, false);
      show(dialDual, false);
      show(dialSingle, true);
      show(cardsWrap, false);
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
    /* d970 — Show Auto mode button (high = visible). */
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

  /* ---- Humidity (n967, raw %) ---- */
  function initHumidity() {
    CrComLib.subscribeState('n', '967', function (val) {
      var n = parseInt(val, 10);
      var row = document.getElementById('climate-sensor-humidity-row');
      var valEl = document.getElementById('climate-sensor-humidity');
      if (!row || !valEl) return;
      if (isFinite(n) && n > 0) {
        valEl.textContent = n + '%';
        row.classList.remove('hidden');
      } else {
        valEl.textContent = '--%';
        row.classList.add('hidden');
      }
    });
  }

  /* ---- Outdoor temp (from weather.js) ---- */
  function applyWeather(payload) {
    var row = document.getElementById('climate-sensor-outdoor-row');
    var valEl = document.getElementById('climate-sensor-outdoor');
    if (!row || !valEl || !payload) return;
    if (isFinite(payload.tempF)) {
      valEl.textContent = payload.tempF + '°';
      row.classList.remove('hidden');
    }
  }
  function initOutdoor() {
    if (window._currentWeather) applyWeather(window._currentWeather);
    window.addEventListener('weather:update', function (ev) {
      applyWeather(ev && ev.detail);
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

  /* ---- Room drawer (matches lighting/shades pattern) ---- */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#climate-room-list .drawer-room');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin  = room.getAttribute('data-select');
        var showJoin    = room.getAttribute('data-show');
        var climateJoin = room.getAttribute('data-climate');
        var labelJoin   = room.getAttribute('data-label');
        var tempJoin    = room.getAttribute('data-temp');

        /* Inject per-zone temp badge (matches lighting/shades) */
        var countEl = room.querySelector('.drawer-room-count');
        if (!countEl) {
          countEl = document.createElement('span');
          countEl.className = 'drawer-room-count';
          countEl.textContent = '';
          room.appendChild(countEl);
        }

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

        /* Per-zone current temp — analog n931-n960.
           Raw °F (e.g. 76) or ×10 tenths (e.g. 760) — values ≥ 200 are divided by 10. */
        if (tempJoin) {
          CrComLib.subscribeState('n', tempJoin, function (val) {
            var n = parseInt(val, 10) || 0;
            if (n <= 0) {
              countEl.textContent = '';
              room.classList.remove('has-count');
              return;
            }
            if (n >= 200) n = Math.round(n / 10);
            countEl.textContent = n + '°';
            room.classList.add('has-count');
          });
        }
      })(rooms[i]);
    }
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var roomPill = document.getElementById('climate-room-pill');
    var overlay = document.getElementById('climate-drawer-overlay');
    if (roomPill) roomPill.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    initTstatName();
    initTemps();
    initStateButtons();
    initVisibility();
    initHumidity();
    initOutdoor();
    initRoomButtons();
    updateSetpointVisibility();

    /* Header title override when climate page active */
    CrComLib.subscribeState('s', '961', function (val) {
      currentRoomName = val || '';
      updateClimateHeader();
      updateRoomPill();
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
