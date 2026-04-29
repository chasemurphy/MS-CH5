/* =========================================================
   Theme Editor — in-panel live CSS variable editor
   Dev-only system page. Changes apply instantly via a
   <style> tag injection. Resets on page reload.
   ========================================================= */
(function () {
  'use strict';

  /* ---- Variable inventory ---- */
  var VARS = {
    root: {
      colors: [
        '--surface-primary', '--surface-secondary', '--surface-pressed',
        '--chrome-bg', '--chrome-surface', '--chrome-nav',
        '--accent', '--accent-hi', '--accent-pressed',
        '--icon-muted', '--text', '--text-on-dark', '--text-muted',
        '--btn-danger', '--btn-danger-press', '--btn-danger-text'
      ],
      rgba_vars: ['--border-accent'],
      triplets:  ['--chrome-bg-rgb', '--black-rgb', '--white-rgb', '--accent-rgb'],
      dims:      ['--header-height', '--nav-height']
    },
    dark: {
      colors: [
        '--surface-primary', '--surface-secondary', '--surface-pressed',
        '--icon-muted', '--chrome-nav',
        '--text', '--text-on-dark', '--text-muted',
        '--btn-danger', '--btn-danger-press'
      ],
      rgba_vars: [], triplets: [], dims: []
    },
    custom: {
      colors: [
        '--surface-primary', '--surface-secondary', '--surface-pressed',
        '--chrome-bg', '--chrome-surface', '--icon-muted',
        '--accent', '--accent-hi', '--accent-pressed', '--chrome-nav',
        '--text', '--text-on-dark', '--text-muted',
        '--btn-danger', '--btn-danger-press', '--btn-danger-text'
      ],
      rgba_vars: ['--border-accent'],
      triplets:  ['--accent-rgb'],
      dims:      []
    }
  };

  /* ---- Override storage: section → varName → cssValue ---- */
  var overrides = { root: {}, dark: {}, custom: {} };

  /* ---- Colour helpers ---- */

  function readVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      return ('0' + Math.round(v).toString(16)).slice(-2);
    }).join('');
  }

  function tripletToHex(str) {
    var p = String(str).split(',').map(function (s) { return parseInt(s.trim(), 10); });
    return (p.length >= 3 && !p.some(isNaN)) ? rgbToHex(p[0], p[1], p[2]) : '#000000';
  }

  function hexToTriplet(hex) {
    var c = hexToRgb(hex);
    return c.r + ', ' + c.g + ', ' + c.b;
  }

  function rgbaToHexAlpha(str) {
    var m = String(str).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (!m) return { hex: '#000000', alpha: 1 };
    return { hex: rgbToHex(+m[1], +m[2], +m[3]), alpha: m[4] !== undefined ? +m[4] : 1 };
  }

  function hexAlphaToRgba(hex, alpha) {
    var c = hexToRgb(hex);
    return 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + alpha + ')';
  }

  /* Normalise any 3-char hex to 6-char */
  function normaliseHex(h) {
    if (/^#[0-9a-f]{3}$/i.test(h)) {
      return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    }
    return h;
  }

  /* ---- Style-tag injection ---- */

  function applyOverride(sec, name, val) {
    overrides[sec][name] = val;
    rebuildStyle();
  }

  function rebuildStyle() {
    var el = document.getElementById('te-overrides');
    if (!el) {
      el = document.createElement('style');
      el.id = 'te-overrides';
      document.head.appendChild(el);
    }
    var map = { root: ':root', dark: 'html[data-theme="dark"]', custom: 'html[data-theme="custom"]' };
    var css = '';
    Object.keys(overrides).forEach(function (sec) {
      var entries = Object.keys(overrides[sec]);
      if (!entries.length) return;
      css += map[sec] + ' {\n';
      entries.forEach(function (k) { css += '  ' + k + ': ' + overrides[sec][k] + ';\n'; });
      css += '}\n';
    });
    el.textContent = css;
  }

  /* ---- Row builders ---- */

  function makeColorRow(sec, name, isThriplet) {
    var savedTheme = document.documentElement.dataset.theme || '';
    document.documentElement.dataset.theme = sec === 'root' ? '' : sec;
    var raw = readVar(name) || '#000000';
    document.documentElement.dataset.theme = savedTheme;

    var hex = normaliseHex(isThriplet ? tripletToHex(raw) : raw);
    if (!/^#[0-9a-f]{6}$/i.test(hex)) hex = '#000000';

    var row = document.createElement('div');
    row.className = 'te-row';

    var lbl = document.createElement('span');
    lbl.className = 'te-label';
    lbl.textContent = name;

    var swatch = document.createElement('span');
    swatch.className = 'te-swatch';
    swatch.style.background = raw;

    var picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'te-picker';
    picker.value = hex;

    var txt = document.createElement('input');
    txt.type = 'text';
    txt.className = 'te-text';
    txt.value = raw;

    function commit(newHex) {
      var cssVal = isThriplet ? hexToTriplet(newHex) : newHex;
      swatch.style.background = cssVal;
      applyOverride(sec, name, cssVal);
    }

    picker.addEventListener('input', function () {
      var cssVal = isThriplet ? hexToTriplet(picker.value) : picker.value;
      txt.value = cssVal;
      commit(picker.value);
    });

    txt.addEventListener('change', function () {
      var v = txt.value.trim();
      if (isThriplet) {
        var h = tripletToHex(v);
        picker.value = h;
        swatch.style.background = v;
        applyOverride(sec, name, v);
      } else if (/^#[0-9a-f]{6}$/i.test(v)) {
        picker.value = v;
        commit(v);
      }
    });

    row.appendChild(lbl);
    row.appendChild(swatch);
    row.appendChild(picker);
    row.appendChild(txt);
    return row;
  }

  function makeRgbaRow(sec, name) {
    var savedTheme = document.documentElement.dataset.theme || '';
    document.documentElement.dataset.theme = sec === 'root' ? '' : sec;
    var raw = readVar(name) || 'rgba(0,0,0,0.2)';
    document.documentElement.dataset.theme = savedTheme;

    var parsed = rgbaToHexAlpha(raw);
    var row = document.createElement('div');
    row.className = 'te-row';

    var lbl = document.createElement('span');
    lbl.className = 'te-label';
    lbl.textContent = name;

    var swatch = document.createElement('span');
    swatch.className = 'te-swatch';
    swatch.style.background = raw;

    var picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'te-picker';
    picker.value = parsed.hex;

    var alphaLbl = document.createElement('span');
    alphaLbl.className = 'te-alpha-label';
    alphaLbl.textContent = 'α';

    var alpha = document.createElement('input');
    alpha.type = 'number';
    alpha.className = 'te-alpha';
    alpha.min = '0'; alpha.max = '1'; alpha.step = '0.05';
    alpha.value = parsed.alpha;

    function commit() {
      var cssVal = hexAlphaToRgba(picker.value, parseFloat(alpha.value) || 0);
      swatch.style.background = cssVal;
      applyOverride(sec, name, cssVal);
    }

    picker.addEventListener('input', commit);
    alpha.addEventListener('input', commit);

    row.appendChild(lbl);
    row.appendChild(swatch);
    row.appendChild(picker);
    row.appendChild(alphaLbl);
    row.appendChild(alpha);
    return row;
  }

  function makeDimRow(sec, name) {
    var savedTheme = document.documentElement.dataset.theme || '';
    document.documentElement.dataset.theme = sec === 'root' ? '' : sec;
    var raw = readVar(name);
    document.documentElement.dataset.theme = savedTheme;

    var row = document.createElement('div');
    row.className = 'te-row te-row--dim';

    var lbl = document.createElement('span');
    lbl.className = 'te-label';
    lbl.textContent = name;

    var txt = document.createElement('input');
    txt.type = 'text';
    txt.className = 'te-text';
    txt.value = raw;

    txt.addEventListener('change', function () {
      applyOverride(sec, name, txt.value.trim());
    });

    row.appendChild(lbl);
    row.appendChild(txt);
    return row;
  }

  /* ---- Section rendering ---- */

  var LABELS = { root: 'Default (:root)', dark: 'Dark Theme', custom: 'Custom Theme' };

  function renderSections() {
    var container = document.getElementById('te-sections');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(VARS).forEach(function (sec) {
      var def = VARS[sec];
      var secEl = document.createElement('div');
      secEl.className = 'te-section';

      var heading = document.createElement('h2');
      heading.className = 'te-section-title';
      heading.textContent = LABELS[sec];
      secEl.appendChild(heading);

      (def.colors || []).forEach(function (n) { secEl.appendChild(makeColorRow(sec, n, false)); });
      (def.rgba_vars || []).forEach(function (n) { secEl.appendChild(makeRgbaRow(sec, n)); });
      (def.triplets || []).forEach(function (n) { secEl.appendChild(makeColorRow(sec, n, true)); });
      (def.dims || []).forEach(function (n) { secEl.appendChild(makeDimRow(sec, n)); });

      container.appendChild(secEl);
    });
  }

  /* ---- Preview theme toggle ---- */

  function setupThemeToggle() {
    document.querySelectorAll('.te-theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.documentElement.dataset.theme = btn.dataset.t;
        document.querySelectorAll('.te-theme-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        renderSections();
      });
    });
  }

  /* ---- Triple-tap access zone ---- */

  function setupTapZone() {
    var zone = document.getElementById('theme-tap-zone');
    if (!zone) return;
    var taps = 0, timer = null;
    function onTap() {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(function () { taps = 0; }, 2000);
      if (taps >= 3) {
        taps = 0;
        if (window.nav) window.nav.go('sys-theme');
      }
    }
    zone.addEventListener('click', onTap);
    zone.addEventListener('touchend', function (e) { e.preventDefault(); onTap(); });
  }

  /* ---- Init ---- */

  document.addEventListener('DOMContentLoaded', function () {
    setupTapZone();
    setupThemeToggle();
    renderSections();
  });

})();
