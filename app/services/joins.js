/* =========================================================
   MSCH5 — Core Infrastructure
   CrComLib Shim | Pulse Helper
   ========================================================= */

/* ---------------------------------------------------------
   CrComLib Development Shim
   Activates only when running in a browser without CrComLib.
   --------------------------------------------------------- */
(function () {
  'use strict';

  if (typeof window.CrComLib !== 'undefined') {
    console.log('[MSCH5] CrComLib detected');
    return;
  }

  console.log('[MSCH5] CrComLib not found — activating dev shim');

  var _subs = {};

  function _key(type, join) {
    return type + '|' + String(join);
  }

  window.CrComLib = {
    subscribeState: function (type, join, callback) {
      var k = _key(type, join);
      if (!_subs[k]) _subs[k] = [];
      _subs[k].push(callback);
      return k;
    },
    unsubscribeState: function (type, join, id) {
      var k = _key(type, join);
      if (_subs[k]) _subs[k] = [];
    },
    publishEvent: function (type, join, value) {
      console.log('[CrComLib Shim] publish', type, join, value);
    }
  };

  window.emulateSignal = function (type, join, value) {
    var k = _key(type, String(join));
    if (_subs[k]) {
      for (var i = 0; i < _subs[k].length; i++) {
        _subs[k][i](value);
      }
    }
  };
})();


/* ---------------------------------------------------------
   Pulse Helper
   --------------------------------------------------------- */
function pulse(join) {
  CrComLib.publishEvent('b', String(join), true);
  CrComLib.publishEvent('b', String(join), false);
}
