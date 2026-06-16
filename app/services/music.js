/* =========================================================
   Music Page — Single-active-zone audio
   ---------------------------------------------------------
   Joins:
     Active zone name      s395
     Active source name    s396
     Zone select+fb (32)   d501–d532
     Zone names (32)       s401–s432
     Zone source names(32) s341–s372    (per-zone active source — drawer subtext)
     Zone-on feedback (32) d581–d612
     Per-zone vol fb (32)  a401–a432    (drawer-only display)
     Source select+fb (80) d401–d480
     Source names (80)     s451–s530
     Source visible (80)   d1701–d1780  (high = show; names still flow in regardless)
     Active vol level      a400
     Vol up / down (hold)  d391 / d392
     Mute (toggle+fb)      d393
     Power off (pulse+fb)  d400
     Now Playing strings   s381 / s382 / s383 / s384  (mapping TBD)
     Artwork URL           s380
     Now Playing visible   d395  (high = show tile, low = hide)
     Transport             d381 Play | d382 Pause | d383 Next | d384 Prev
     Media panel toggle    d301 (carried over from music-v2)
   ========================================================= */
(function () {
  'use strict';

  /* ---- Active zone / source name (header) ---- */
  var currentRoomName = '';
  var currentSourceName = '';

  function updateMusicHeader() {
    var page = document.getElementById('page-music');
    if (!page || !page.classList.contains('active')) return;
    var titleEl = document.getElementById('header-title');
    if (titleEl) titleEl.textContent = currentRoomName || 'Music';
  }

  function updateRoomPillLabel() {
    var lbl = document.querySelector('#music-room-pill .music-room-pill-label');
    if (lbl) lbl.textContent = currentRoomName || 'Select Zone';
  }

  window._musicGetTitle = updateMusicHeader;

  /* ---- Drawer ---- */
  function openRoomDrawer() {
    document.getElementById('music-room-drawer').classList.add('open');
    document.getElementById('music-drawer-overlay').classList.add('open');
    closeVolDrawer();
  }
  function closeRoomDrawer() {
    document.getElementById('music-room-drawer').classList.remove('open');
    document.getElementById('music-drawer-overlay').classList.remove('open');
  }

  /* ---- Header volume pill + drawer (phone) ---- */
  function openVolDrawer() {
    var pill = document.getElementById('music-vol-pill');
    var drawer = document.getElementById('music-vol-drawer');
    if (pill) pill.classList.add('open');
    if (drawer) drawer.classList.add('open');
  }
  function closeVolDrawer() {
    var pill = document.getElementById('music-vol-pill');
    var drawer = document.getElementById('music-vol-drawer');
    if (pill) pill.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
  }
  function toggleVolDrawer() {
    var pill = document.getElementById('music-vol-pill');
    if (pill && pill.classList.contains('open')) closeVolDrawer();
    else { closeRoomDrawer(); openVolDrawer(); }
  }

  /* ---- Media panel: fills .music-main; opened by tapping Now Playing ---- */
  function setMediaPanelOpen(open) {
    var panel = document.getElementById('music-media-panel');
    if (!panel) return;
    panel.classList.toggle('open', !!open);
    CrComLib.publishEvent('b', '301', !!open);
  }
  function toggleMediaPanel() {
    var panel = document.getElementById('music-media-panel');
    if (!panel) return;
    setMediaPanelOpen(!panel.classList.contains('open'));
  }

  function styleMediaPlayer() {
    var mp = document.getElementById('media-player-v2');
    if (!mp) return;
    var vars = {
      '--ch5-media-player--background-color': 'var(--surface-primary)',
      '--ch5-media-player--default-icon-color': 'var(--text)',
      '--ch5-media-player--now-playing-icon-color': 'var(--text)',
      '--ch5-media-player--header-icon-color': 'var(--text)',
      '--ch5-media-player--default-mp-back-icon-color': 'var(--text)',
      '--ch5-media-player--my-music-menu-icon-color': 'var(--accent)',
      '--ch5-media-player--active-icon-color': '#ffffff',
      '--ch5-media-player--active-icon-background-color': 'var(--accent)',
      '--ch5-media-player--icon-button-pressed-background-color': 'var(--surface-secondary)',
      '--ch5-media-player--header-icon-background-color': 'var(--surface-secondary)',
      '--ch5-media-player--primary-font-color': 'var(--text)',
      '--ch5-media-player--secondary-font-color': 'var(--text-muted, var(--icon-muted))',
      '--ch5-media-player--default-header-text-color': 'var(--text)',
      '--ch5-media-player--default-track-info-text-color': 'var(--text)',
      '--ch5-media-player--default-provider-text-color': 'var(--text-muted, var(--icon-muted))',
      '--ch5-media-player--default-progressbar-time-color': 'var(--text-muted, var(--icon-muted))',
      '--ch5-media-player--progressbar-background-color': 'var(--surface-secondary)',
      '--ch5-media-player--progressbar-track-color': 'var(--accent)',
      '--ch5-media-player--default-progressbar-color': 'var(--surface-secondary)',
      '--ch5-media-player--loading-indicator-color': 'var(--accent)',
      '--ch5-media-player--player-name-background-color': 'var(--surface-secondary)',
      '--ch5-media-player--border-color': 'var(--border-accent)',
      '--ch5-media-player--default-border-color': 'var(--border-accent)',
      '--ch5-media-player--menu-items-border-color': 'var(--border-accent)',
      '--ch5-media-player--default-menu-items-border-color': 'var(--border-accent)',
      '--ch5-media-player--active-menu-list-item-background-color': 'rgba(var(--accent-rgb), 0.1)',
      '--ch5-media-player--default-album-art-placeholder-color': 'var(--surface-secondary)',
      '--ch5-media-player--popup-font-color': 'var(--text)',
      '--ch5-media-player--popup-border-color': 'var(--border-accent)',
      '--ch5-media-player--popup-overlay-background-color': 'rgba(0, 0, 0, 0.5)',
      '--ch5-media-player--popup-active-button-background-color': 'var(--accent)',
      '--ch5-media-player--popup-active-button-color': '#ffffff',
      '--ch5-media-player--popup-input-border-color': 'var(--border-accent)'
    };
    for (var k in vars) mp.style.setProperty(k, vars[k]);
  }

  /* ---- Pulse buttons (data-click): pointerdown publishes true+false ---- */
  function initPulseButtons() {
    var btns = document.querySelectorAll('#page-music [data-click]');
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

  /* ---- Transport feedback: Play/Pause use the same join for press + state ---- */
  function initTransportFeedback() {
    var pairs = [
      { join: '381', sel: '#page-music .music-transport-play' },
      { join: '382', sel: '#page-music .music-transport-pause' }
    ];
    pairs.forEach(function (p) {
      var btn = document.querySelector(p.sel);
      if (!btn) return;
      CrComLib.subscribeState('b', p.join, function (val) {
        btn.classList.toggle('selected', val === true || val === 'true');
      });
    });
  }

  /* ---- Hold-high buttons (data-hold) ---- */
  function initHoldButtons() {
    var btns = document.querySelectorAll('#page-music [data-hold]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var join = btn.getAttribute('data-hold');
        btn.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          btn.classList.add('pressed');
          CrComLib.publishEvent('b', join, true);
        });
        function release() {
          btn.classList.remove('pressed');
          CrComLib.publishEvent('b', join, false);
        }
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointerleave', release);
        btn.addEventListener('pointercancel', release);
      })(btns[i]);
    }
  }

  /* ---- Zone drawer rows ---- */
  function initRoomButtons() {
    var rooms = document.querySelectorAll('#music-room-list .drawer-room');
    for (var i = 0; i < rooms.length; i++) {
      (function (room) {
        var selectJoin = room.getAttribute('data-select');
        var labelJoin  = room.getAttribute('data-label');
        var onJoin     = room.getAttribute('data-on');
        var volJoin    = room.getAttribute('data-vol');
        var srcJoin    = room.getAttribute('data-source');

        room.addEventListener('click', function () {
          CrComLib.publishEvent('b', selectJoin, true);
          CrComLib.publishEvent('b', selectJoin, false);
          setTimeout(closeRoomDrawer, 200);
        });

        /* select-join feedback drives the brass left-bar selection */
        CrComLib.subscribeState('b', selectJoin, function (val) {
          room.classList.toggle('selected', val === true || val === 'true');
        });

        /* zone-on feedback drives the brass dot */
        if (onJoin) {
          CrComLib.subscribeState('b', onJoin, function (val) {
            room.classList.toggle('zone-on', val === true || val === 'true');
          });
        }

        /* zone name + visibility (hide rows with empty name) */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = room.querySelector('.drawer-room-name');
          if (nameEl) nameEl.textContent = val || '';
          room.classList.toggle('visible', !!(val && val.trim()));
        });

        /* small per-zone volume readout in the drawer row */
        if (volJoin) {
          CrComLib.subscribeState('n', volJoin, function (val) {
            var n = Number(val) || 0;
            var pct = Math.round(n / 655.35);
            var volEl = room.querySelector('.drawer-room-vol');
            if (volEl) volEl.textContent = pct + '%';
          });
        }

        /* per-zone active source (drawer subtext) */
        if (srcJoin) {
          CrComLib.subscribeState('s', srcJoin, function (val) {
            var srcEl = room.querySelector('.drawer-room-source');
            if (!srcEl) return;
            var text = (val || '').trim();
            srcEl.textContent = text || '— off —';
          });
        }
      })(rooms[i]);
    }
  }

  /* ---- Source buttons ---- */
  function initSourceButtons() {
    var btns = document.querySelectorAll('#music-source-list .music-source-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var clickJoin = btn.getAttribute('data-click');
        var labelJoin = btn.getAttribute('data-label');
        var showJoin  = btn.getAttribute('data-show');

        btn.addEventListener('click', function () {
          CrComLib.publishEvent('b', clickJoin, true);
          CrComLib.publishEvent('b', clickJoin, false);
        });

        /* selected feedback (same join as click) */
        CrComLib.subscribeState('b', clickJoin, function (val) {
          btn.classList.toggle('selected', val === true || val === 'true');
        });

        /* source name — always populated (used elsewhere for "Current Source" display) */
        CrComLib.subscribeState('s', labelJoin, function (val) {
          var nameEl = btn.querySelector('.music-source-name');
          if (nameEl) nameEl.textContent = val || '';
        });

        /* visibility now driven by dedicated digital join */
        if (showJoin) {
          CrComLib.subscribeState('b', showJoin, function (val) {
            btn.classList.toggle('visible', val === true || val === 'true');
          });
        }
      })(btns[i]);
    }
  }

  /* ---- Active zone / source name ---- */
  function initActiveStrings() {
    CrComLib.subscribeState('s', '395', function (val) {
      currentRoomName = val || '';
      updateMusicHeader();
      updateRoomPillLabel();
    });
    CrComLib.subscribeState('s', '396', function (val) {
      currentSourceName = val || '';
    });
  }

  /* ---- Volume (active zone, a400) ---- */
  function initVolume() {
    var arcCircumference = 2 * Math.PI * 31; /* r=31 in viewBox 0 0 72 72 */
    var arcFg = document.getElementById('music-vol-arc-fg');
    if (arcFg) {
      arcFg.style.strokeDasharray = arcCircumference;
      arcFg.style.strokeDashoffset = arcCircumference;
    }

    CrComLib.subscribeState('n', '400', function (val) {
      var n = Number(val) || 0;
      var pct = Math.round(n / 655.35);
      var pctClamped = Math.max(0, Math.min(100, pct));
      var pctText = pctClamped + '%';

      var arcNum = document.getElementById('music-vol-arc-num');
      if (arcNum) arcNum.textContent = pctClamped;
      if (arcFg) arcFg.style.strokeDashoffset = arcCircumference * (1 - pctClamped / 100);

      var bigNum = document.getElementById('music-vol-big-num');
      if (bigNum) bigNum.textContent = pctClamped;

      var barFill = document.getElementById('music-vol-bar-fill');
      if (barFill) barFill.style.width = pctClamped + '%';

      /* Header pill + phone drawer */
      var pillPct = document.getElementById('music-vol-pill-pct');
      if (pillPct) pillPct.textContent = pctText;
      var drawerPct = document.getElementById('music-vol-drawer-pct');
      if (drawerPct) drawerPct.textContent = pctText;
      var drawerFill = document.getElementById('music-vol-drawer-fill');
      if (drawerFill) drawerFill.style.width = pctClamped + '%';
    });
  }

  /* ---- Mute feedback ---- */
  function initMute() {
    CrComLib.subscribeState('b', '393', function (val) {
      var on = val === true || val === 'true';
      var muteBtn = document.getElementById('music-mute-btn');
      if (muteBtn) muteBtn.classList.toggle('muted', on);
      var arc = document.querySelector('#page-music .music-vol-arc');
      if (arc) arc.classList.toggle('muted', on);
      var pill = document.getElementById('music-vol-pill');
      if (pill) pill.classList.toggle('muted', on);
      var drawerMute = document.getElementById('music-vol-drawer-mute');
      if (drawerMute) drawerMute.classList.toggle('muted', on);
    });
  }

  /* ---- Power off feedback ---- */
  function initPower() {
    CrComLib.subscribeState('b', '400', function (val) {
      var btn = document.getElementById('music-power-btn');
      if (btn) btn.classList.toggle('off', val === true || val === 'true');
    });
  }

  /* ---- Now Playing marquee scroll for overflowing lines ---- */
  function updateNpScroll(inner) {
    if (!inner) return;
    var outer = inner.parentElement; /* .music-np-text */
    if (!outer) return;
    var overflow = inner.scrollWidth - outer.clientWidth;
    if (overflow > 4) {
      var pxPerSec = 50;
      var travelSec = overflow / pxPerSec;
      var dur = Math.max(6, travelSec * 2 + 4); /* travel + ~2s pause each end */
      outer.style.setProperty('--np-scroll-d', overflow + 'px');
      outer.style.setProperty('--np-scroll-dur', dur + 's');
      outer.classList.add('scrolling');
    } else {
      outer.classList.remove('scrolling');
      outer.style.removeProperty('--np-scroll-d');
      outer.style.removeProperty('--np-scroll-dur');
    }
  }
  function refreshAllNpScroll() {
    var inners = document.querySelectorAll('#page-music .music-np-text-inner');
    for (var i = 0; i < inners.length; i++) updateNpScroll(inners[i]);
  }

  /* ---- Now Playing strings + artwork ---- */
  function initNowPlaying() {
    [381, 382, 383, 384].forEach(function (j) {
      CrComLib.subscribeState('s', String(j), function (val) {
        var el = document.getElementById('music-np-' + j);
        if (!el) return;
        el.textContent = val || '';
        requestAnimationFrame(function () { updateNpScroll(el); });
      });
    });
    CrComLib.subscribeState('s', '380', function (val) {
      var img = document.getElementById('music-art');
      if (!img) return;
      var url = (val || '').trim();
      if (url) {
        img.src = url;
        img.hidden = false;
      } else {
        img.removeAttribute('src');
        img.hidden = true;
      }
    });
    /* d395 high = show Now Playing tile + transport row; low = hide them */
    CrComLib.subscribeState('b', '395', function (val) {
      var on = val === true || val === 'true';
      var card = document.querySelector('#page-music .music-now-playing');
      var transport = document.querySelector('#page-music .music-transport-row');
      if (card) card.classList.toggle('hidden', !on);
      if (transport) transport.classList.toggle('hidden', !on);
      if (on) requestAnimationFrame(refreshAllNpScroll);
    });

    /* Re-evaluate marquee overflow on layout/size changes */
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (e) {
          var inner = e.target.querySelector('.music-np-text-inner');
          if (inner) updateNpScroll(inner);
        });
      });
      var outers = document.querySelectorAll('#page-music .music-np-text');
      for (var i = 0; i < outers.length; i++) ro.observe(outers[i]);
    }
    window.addEventListener('resize', refreshAllNpScroll);
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.getElementById('page-music');
    if (!page) return;

    var roomToggle  = document.getElementById('music-room-toggle');
    var roomPill    = document.getElementById('music-room-pill');
    var mediaToggle = document.getElementById('music-media-toggle');
    var mediaClose  = document.getElementById('music-media-close');
    var nowPlaying  = page.querySelector('.music-now-playing');
    var overlay     = document.getElementById('music-drawer-overlay');
    var volPill     = document.getElementById('music-vol-pill');

    if (roomToggle)  roomToggle.addEventListener('click', openRoomDrawer);
    if (roomPill)    roomPill.addEventListener('click', openRoomDrawer);
    if (mediaToggle) mediaToggle.addEventListener('click', toggleMediaPanel);
    if (mediaClose)  mediaClose.addEventListener('click', function () { setMediaPanelOpen(false); });
    if (nowPlaying)  nowPlaying.addEventListener('click', function () { setMediaPanelOpen(true); });
    if (overlay)     overlay.addEventListener('click', function () { closeRoomDrawer(); closeVolDrawer(); });
    if (volPill)     volPill.addEventListener('click', function (e) { e.preventDefault(); toggleVolDrawer(); });

    styleMediaPlayer();

    initPulseButtons();
    initHoldButtons();
    initRoomButtons();
    initSourceButtons();
    initActiveStrings();
    initVolume();
    initMute();
    initPower();
    initNowPlaying();
    initTransportFeedback();
  });
})();
