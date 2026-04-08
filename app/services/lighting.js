/* =========================================================
   Lighting Page — Drawer, Scene Panel, Visibility, Room Joins
   ========================================================= */
(function () {
  'use strict';

  function toggleDrawer() {
    document.getElementById('lighting-room-drawer').classList.toggle('open');
    document.getElementById('lighting-drawer-overlay').classList.toggle('open');
  }

  function closeDrawer() {
    document.getElementById('lighting-room-drawer').classList.remove('open');
    document.getElementById('lighting-drawer-overlay').classList.remove('open');
  }

  function toggleScenePanel() {
    document.getElementById('lighting-scene-panel').classList.toggle('open');
  }

  /* Hide load cards whose name is empty (same pattern as music.js) */
  function updateLoadVisibility() {
    var cards = document.querySelectorAll('#page-lighting .load-card');
    for (var i = 0; i < cards.length; i++) {
      var nameEl = cards[i].querySelector('.load-name');
      var text = nameEl ? nameEl.textContent.trim() : '';
      cards[i].style.display = text ? '' : 'none';
    }
  }

  /* Hide scene buttons whose label is empty */
  function updateSceneVisibility() {
    var btns = document.querySelectorAll('#page-lighting .scene-btn');
    for (var i = 0; i < btns.length; i++) {
      var label = btns[i].querySelector('.ch5-button--label');
      var text = label ? label.textContent.trim() : '';
      btns[i].style.display = text ? '' : 'none';
    }
  }

  /* Wire up room drawer buttons (plain divs) to CrComLib */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#lighting-room-list .drawer-room');

    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin = room.getAttribute('data-select');
        var showJoin   = room.getAttribute('data-show');
        var lightsJoin = room.getAttribute('data-lights');
        var labelJoin  = room.getAttribute('data-label');

        /* Click → pulse digital select join */
        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeDrawer, 200);
        });

        /* Selected feedback */
        CrComLib.subscribeState('b', selectJoin, function (val) {
          room.classList.toggle('selected', val === true || val === 'true');
        });

        /* Visible feedback */
        CrComLib.subscribeState('b', showJoin, function (val) {
          room.classList.toggle('visible', val === true || val === 'true');
        });

        /* Lights-on indicator */
        CrComLib.subscribeState('b', lightsJoin, function (val) {
          room.classList.toggle('lights-on', val === true || val === 'true');
        });

        /* Room name */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val;
        });
      })(rooms[i]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Drawer toggle — use mousedown on the ch5-button wrapper
       because ch5-button doesn't reliably fire native click */
    var roomToggle = document.getElementById('lighting-room-toggle');
    var overlay = document.getElementById('lighting-drawer-overlay');
    if (roomToggle) roomToggle.addEventListener('mousedown', toggleDrawer);
    if (overlay) overlay.addEventListener('mousedown', closeDrawer);

    /* Scene panel toggle */
    var sceneToggle = document.getElementById('lighting-scene-toggle');
    if (sceneToggle) sceneToggle.addEventListener('mousedown', toggleScenePanel);

    /* Wire up room buttons */
    initRoomButtons();

    /* Visibility observers */
    var page = document.getElementById('page-lighting');
    if (page) {
      var observer = new MutationObserver(function () {
        updateLoadVisibility();
        updateSceneVisibility();
      });
      observer.observe(page, {
        childList: true,
        subtree: true,
        characterData: true
      });
      updateLoadVisibility();
      updateSceneVisibility();
    }
  });
})();
