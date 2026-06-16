/* =========================================================
   Weather — Open-Meteo current conditions for Home greeting
   Renders an inline chip (icon + temp + condition) next to the
   date. Lat/long default to Houston, TX; SIMPL may override
   via serial joins s250 (latitude) and s251 (longitude).
   ========================================================= */
(function () {
  'use strict';

  var DEFAULT_LAT = 29.7633;
  var DEFAULT_LON = -95.3633;
  var REFRESH_MS  = 10 * 60 * 1000;
  var LAT_JOIN    = '250';
  var LON_JOIN    = '251';

  var lat = DEFAULT_LAT;
  var lon = DEFAULT_LON;
  var pending = false;

  /* WMO weather code → FontAwesome icon + label */
  function decodeWmo(code) {
    switch (code) {
      case 0:  return { icon: 'fas fa-sun',                 label: 'Sunny' };
      case 1:
      case 2:  return { icon: 'fas fa-cloud-sun',           label: 'Partly cloudy' };
      case 3:  return { icon: 'fas fa-cloud',               label: 'Cloudy' };
      case 45:
      case 48: return { icon: 'fas fa-smog',                label: 'Fog' };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57: return { icon: 'fas fa-cloud-rain',          label: 'Drizzle' };
      case 61:
      case 63:
      case 65:
      case 66:
      case 67: return { icon: 'fas fa-cloud-showers-heavy', label: 'Rain' };
      case 71:
      case 73:
      case 75:
      case 77: return { icon: 'fas fa-snowflake',           label: 'Snow' };
      case 80:
      case 81:
      case 82: return { icon: 'fas fa-cloud-showers-heavy', label: 'Showers' };
      case 85:
      case 86: return { icon: 'fas fa-snowflake',           label: 'Snow showers' };
      case 95:
      case 96:
      case 99: return { icon: 'fas fa-bolt',                label: 'Thunderstorm' };
      default: return { icon: 'fas fa-cloud',               label: '' };
    }
  }

  function buildUrl() {
    return 'https://api.open-meteo.com/v1/forecast'
      + '?latitude='  + encodeURIComponent(lat)
      + '&longitude=' + encodeURIComponent(lon)
      + '&timezone=auto&forecast_days=1'
      + '&temperature_unit=fahrenheit'
      + '&wind_speed_unit=mph&precipitation_unit=inch'
      + '&current=temperature_2m,weather_code,cloud_cover'
      + '&daily=weather_code';
  }

  function render(current) {
    var wrap    = document.getElementById('home-greeting-weather');
    if (!wrap || !current) return;
    var iconEl  = wrap.querySelector('.home-weather-icon');
    var tempEl  = wrap.querySelector('.home-weather-temp');
    var condEl  = wrap.querySelector('.home-weather-cond');

    var info = decodeWmo(current.weather_code);
    if (iconEl) iconEl.className = 'home-weather-icon ' + info.icon;
    if (tempEl) tempEl.textContent = Math.round(current.temperature_2m) + '°';
    if (condEl) condEl.textContent = info.label;

    wrap.hidden = false;

    /* Broadcast for other pages (Climate Sensors, etc.) */
    var payload = {
      tempF: Math.round(current.temperature_2m),
      code:  current.weather_code,
      label: info.label,
      icon:  info.icon
    };
    window._currentWeather = payload;
    try {
      window.dispatchEvent(new CustomEvent('weather:update', { detail: payload }));
    } catch (e) { /* CustomEvent may not exist in legacy runtimes */ }
  }

  function fetchWeather() {
    if (pending || !window.fetch) return;
    pending = true;
    fetch(buildUrl(), { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && data.current) render(data.current);
      })
      .catch(function (err) {
        console.warn('[weather] fetch failed:', err && err.message ? err.message : err);
      })
      .then(function () { pending = false; });
  }

  function applyCoord(which, raw) {
    var n = parseFloat((raw || '').toString().trim());
    if (!isFinite(n)) {
      if (which === 'lat') lat = DEFAULT_LAT;
      else                 lon = DEFAULT_LON;
    } else {
      if (which === 'lat') lat = n;
      else                 lon = n;
    }
  }

  function subscribeCoords() {
    if (!window.CrComLib) return;
    CrComLib.subscribeState('s', LAT_JOIN, function (val) {
      var prev = lat;
      applyCoord('lat', val);
      if (lat !== prev) fetchWeather();
    });
    CrComLib.subscribeState('s', LON_JOIN, function (val) {
      var prev = lon;
      applyCoord('lon', val);
      if (lon !== prev) fetchWeather();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    subscribeCoords();
    fetchWeather();
    setInterval(fetchWeather, REFRESH_MS);
  });
})();
