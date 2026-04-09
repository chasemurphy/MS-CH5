/* =========================================================
   Theme Service — SIMPL Analog Join → CSS Theme
   ========================================================= */
(function () {
  'use strict';

  var THEME_JOIN = '1';

  var themes = [
    'light',
    'dark'
  ];

  function applyTheme(index) {
    var name = themes[index] || themes[0];
    if (name === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
    console.log('[MSCH5] Theme applied:', name);
  }

  document.addEventListener('DOMContentLoaded', function () {
    CrComLib.subscribeState('n', THEME_JOIN, function (val) {
      var index = parseInt(val, 10);
      if (isNaN(index)) index = 0;
      applyTheme(index);
    });
  });

  window.theme = {
    set: function (index) {
      applyTheme(index);
    }
  };
})();
