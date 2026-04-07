/* =========================================================
   Music Page — View Toggle (Zones / Media Player)
   SIMPL drives the toggle via digital join d303.
   d303 high = show media player, low = show zones (default)
   ========================================================= */
(function () {
  'use strict';

  var zonesView = null;
  var playerView = null;

  function showZones() {
    if (zonesView) zonesView.classList.remove('hidden');
    if (playerView) playerView.classList.add('hidden');
  }

  function showPlayer() {
    if (zonesView) zonesView.classList.add('hidden');
    if (playerView) playerView.classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', function () {
    zonesView = document.getElementById('music-zones-view');
    playerView = document.getElementById('music-player-view');

    if (!zonesView || !playerView) return;

    /* Default: show zones, hide media player */
    showZones();

    /* SIMPL drives toggle via d303 */
    CrComLib.subscribeState('b', '303', function (val) {
      if (val === true || val === 'true') {
        showPlayer();
      } else {
        showZones();
      }
    });
  });
})();
