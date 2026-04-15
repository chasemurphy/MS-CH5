# Phase 4 — AV Page Plan

**Status:** Approved for development  
**Sprint scope:** AV page — room drawer, source drawer, subpages (No Control, DirecTV, Comcast, DVD1, AppleTV). Kaleidescape deferred to Phase 4b.

---

## Join Map (Authoritative — from SIMPL)

### System / Volume
| Purpose | Type | Join | Notes |
|---------|------|------|-------|
| Volume up | Digital | `d[15]` | Hold high |
| Volume down | Digital | `d[16]` | Hold high |
| Mute toggle | Digital | `d[17]` | Pulse + feedback |
| Volume level | Analog | `a[1]` | 0–65535; hide display if 0 |

### Room
| Purpose | Type | Join | Notes |
|---------|------|------|-------|
| Room names | Serial | `s[21]`–`s[37]` | 17 rooms |
| Room select + ON feedback | Digital | `d[21]`–`d[37]` | Pulse to select; same join as FB |
| Room power off + feedback | Digital | `d[40]` | Pulse + FB |

### Source
| Purpose | Type | Join | Notes |
|---------|------|------|-------|
| Source names | Serial | `s[81]`–`s[104]` | Up to 24 sources; empty = hidden |
| Active source name | Serial | `s[40]` | Display in bottom bar |
| Source select + feedback | Digital | `d[41]`–`d[59]` | Pulse + FB (up to 19 sources) |
| Source icon override | Analog | `a[41]`–`a[64]` | 0 or 99 = derive from name; else use map |

### Subpage Type (SIMPL → Panel — which control panel to show)
| Join | Subpage |
|------|---------|
| `d[60]` | No control |
| `d[61]` | SAT1 — DirecTV |
| `d[62]` | SAT2 — Comcast |
| `d[63]` | DVD1 |
| `d[64]` | *(deferred — DVD2)* |
| `d[65]` | *(deferred — Kaleidescape)* |
| `d[67]` | AppleTV |

### Shared Control Buttons
| Button | Join | Type |
|--------|------|------|
| D-pad Up | `d[120]` | Pulse |
| D-pad Down | `d[121]` | Pulse |
| D-pad Left | `d[122]` | Pulse |
| D-pad Right | `d[123]` | Pulse |
| D-pad Select | `d[124]` | Pulse |
| Rew | `d[131]` | Pulse |
| Pause | `d[132]` | Pulse |
| Play/Pause (combined) | `d[133]` | Pulse |
| Stop | `d[134]` | Pulse |
| Record | `d[135]` | Pulse |
| FFWD | `d[136]` | Pulse |
| Forward/Skip Fwd | `d[137]` | Pulse (DirecTV) |
| Replay | `d[138]` | Pulse (DirecTV) |
| Menu / XFinity | `d[142]` | Pulse (shared label differs per subpage) |
| Guide | `d[143]` | Pulse |
| Info | `d[144]` | Pulse |
| Exit | `d[145]` | Pulse |
| List | `d[146]` | Pulse (DirecTV) |
| Last | `d[128]` | Pulse |
| Record | `d[135]` | Pulse |
| Channel Up | `d[126]` | Pulse |
| Channel Down | `d[127]` | Pulse |
| Page Up | `d[181]` | Pulse (Comcast); also DVD Home `d[181]` |
| Page Down | `d[182]` | Pulse (Comcast); also DVD Top Menu `d[182]` |
| DVD Popup Menu | `d[183]` | Pulse |
| DVD Eject | `d[184]` | Pulse |
| DVD Return/Exit | `d[185]` | Pulse |
| Numeric 1–9 | `d[100]`–`d[108]` | Pulse |
| Numeric 0 | `d[109]` | Pulse |
| Dash | `d[112]` | Pulse |
| Enter (DirecTV) | `d[115]` | Pulse |
| Enter (Comcast/DVD) | `d[111]` | Pulse |
| Red | `d[148]` | Pulse |
| Green | `d[149]` | Pulse |
| Yellow | `d[150]` | Pulse |
| Blue | `d[151]` | Pulse |

---

## File Changes

### 1. `app/services/joins.js` — add AV block
```javascript
// AV
AV_ROOM_NAMES_S:    { start: 21,  count: 17 },
AV_ROOM_SEL_D:      { start: 21,  count: 17 },
AV_ROOM_OFF_D:      40,
AV_SRC_NAMES_S:     { start: 81,  count: 24 },
AV_ACTIVE_SRC_S:    40,
AV_SRC_SEL_D:       { start: 41,  count: 19 },
AV_SRC_ICON_A:      { start: 41,  count: 24 },
AV_SUBPAGE_D:       { start: 60,  count: 8  },
VOL_UP_D:           15,
VOL_DN_D:           16,
MUTE_D:             17,
VOL_LEVEL_A:        1,
// Transport / nav buttons
AV_DPAD_UP_D:       120, AV_DPAD_DN_D:   121,
AV_DPAD_LT_D:       122, AV_DPAD_RT_D:   123,
AV_DPAD_SEL_D:      124,
AV_REW_D:           131, AV_PAUSE_D:     132,
AV_PLAY_PAUSE_D:    133, AV_STOP_D:      134,
AV_RECORD_D:        135, AV_FFWD_D:      136,
AV_FWD_D:           137, AV_REPLAY_D:    138,
AV_LAST_D:          128, AV_CH_UP_D:     126,
AV_CH_DN_D:         127,
AV_MENU_D:          142, AV_GUIDE_D:     143,
AV_INFO_D:          144, AV_EXIT_D:      145,
AV_LIST_D:          146,
AV_PAGE_UP_D:       181, AV_PAGE_DN_D:   182,
AV_DVD_POPUP_D:     183, AV_DVD_EJECT_D: 184,
AV_DVD_RETURN_D:    185,
AV_KEY_D:           { start: 100, count: 10 },  // 0=key1 ... 8=key9, 9=key0
AV_DASH_D:          112,
AV_ENTER_DTV_D:     115, AV_ENTER_D:     111,
AV_RED_D:           148, AV_GREEN_D:     149,
AV_YELLOW_D:        150, AV_BLUE_D:      151,
```

### 2. `app/index.html` — add AV page

```html
<div id="page-av" class="page">

  <!-- Drawer overlay -->
  <div id="av-drawer-overlay" class="drawer-overlay"></div>

  <!-- Room drawer (left) — 17 rooms d21-d37 / s21-s37 -->
  <div id="av-room-drawer" class="room-drawer">
    <div class="drawer-header">Select Room</div>
    <div class="drawer-list" id="av-room-list">
      <!-- JS renders: 17 × .drawer-room[data-index=N] -->
    </div>
  </div>

  <!-- Source drawer (right) — up to 24 sources -->
  <div id="av-source-panel" class="scene-panel">
    <div class="scene-panel-title">Sources</div>
    <div class="scene-panel-list" id="av-source-list">
      <!-- JS renders: 24 × .av-source-btn[data-index=N] -->
    </div>
  </div>

  <!-- Main content -->
  <div class="av-main">

    <!-- Subpage: No Control -->
    <div id="av-sub-nocontrol" class="av-subpage av-sub-nocontrol">
      <span class="av-no-control-msg">No source selected</span>
    </div>

    <!-- Subpage: DirecTV (d61) -->
    <div id="av-sub-sat1" class="av-subpage">
      <div class="av-left-strip">
        <button class="av-btn" data-click="143">Guide</button>
        <button class="av-btn" data-click="142">Menu</button>
        <button class="av-btn" data-click="144">Info</button>
        <button class="av-btn" data-click="145">Exit</button>
        <button class="av-btn" data-click="135">Record</button>
        <button class="av-btn" data-click="146">List</button>
      </div>
      <div class="av-center-col">
        <div class="av-ch-cluster">
          <button class="av-ch-btn" data-click="126">▲</button>
          <span class="av-ch-label">Channel</span>
          <button class="av-ch-btn" data-click="127">▼</button>
          <button class="av-btn av-last-btn" data-click="128">Last</button>
        </div>
        <div class="av-dpad-wrap">
          <div class="av-colored-btn av-red"    data-click="148"></div>
          <div class="av-colored-btn av-green"  data-click="149"></div>
          <div class="av-dpad">
            <button class="av-dpad-up"    data-click="120"></button>
            <button class="av-dpad-left"  data-click="122"></button>
            <button class="av-dpad-sel"   data-click="124">Select</button>
            <button class="av-dpad-right" data-click="123"></button>
            <button class="av-dpad-down"  data-click="121"></button>
          </div>
          <div class="av-colored-btn av-yellow" data-click="150"></div>
          <div class="av-colored-btn av-blue"   data-click="151"></div>
        </div>
        <div class="av-transport-row">
          <button class="av-transport-btn" data-click="133" title="Play">▶</button>
          <button class="av-transport-btn" data-click="132" title="Pause">⏸</button>
          <button class="av-transport-btn" data-click="134" title="Stop">⏹</button>
          <button class="av-transport-btn" data-click="138" title="Replay">↺</button>
          <button class="av-transport-btn" data-click="131" title="Rew">⏪</button>
          <button class="av-transport-btn" data-click="136" title="FFWD">⏩</button>
          <button class="av-transport-btn" data-click="137" title="Fwd">⏭</button>
        </div>
      </div>
      <div class="av-numpad">
        <button data-click="100">1</button><button data-click="101">2</button><button data-click="102">3</button>
        <button data-click="103">4</button><button data-click="104">5</button><button data-click="105">6</button>
        <button data-click="106">7</button><button data-click="107">8</button><button data-click="108">9</button>
        <button data-click="112">_</button><button data-click="109">0</button>
        <button class="av-enter" data-click="115">Enter</button>
      </div>
    </div>

    <!-- Subpage: Comcast (d62) -->
    <div id="av-sub-sat2" class="av-subpage">
      <div class="av-left-strip">
        <button class="av-btn" data-click="143">Guide</button>
        <button class="av-btn" data-click="142">XFinity</button>
        <button class="av-btn" data-click="144">Info</button>
        <button class="av-btn" data-click="145">Exit</button>
        <button class="av-btn" data-click="135">Record</button>
        <button class="av-btn" data-click="128">Last</button>
      </div>
      <div class="av-center-col">
        <div class="av-ch-cluster">
          <button class="av-ch-btn" data-click="126">▲</button>
          <span class="av-ch-label">Channel</span>
          <button class="av-ch-btn" data-click="127">▼</button>
          <button class="av-ch-btn" data-click="181">▲</button>
          <span class="av-ch-label">Page</span>
          <button class="av-ch-btn" data-click="182">▼</button>
        </div>
        <div class="av-dpad-wrap">
          <div class="av-dpad">
            <button class="av-dpad-up"    data-click="120"></button>
            <button class="av-dpad-left"  data-click="122"></button>
            <button class="av-dpad-sel"   data-click="124">Select</button>
            <button class="av-dpad-right" data-click="123"></button>
            <button class="av-dpad-down"  data-click="121"></button>
          </div>
        </div>
        <div class="av-transport-row">
          <button class="av-transport-btn" data-click="133" title="Play/Pause">▶⏸</button>
          <button class="av-transport-btn" data-click="131" title="Rew">⏪</button>
          <button class="av-transport-btn" data-click="136" title="FFWD">⏩</button>
        </div>
      </div>
      <div class="av-numpad">
        <button data-click="100">1</button><button data-click="101">2</button><button data-click="102">3</button>
        <button data-click="103">4</button><button data-click="104">5</button><button data-click="105">6</button>
        <button data-click="106">7</button><button data-click="107">8</button><button data-click="108">9</button>
        <button data-click="112">_</button><button data-click="109">0</button>
        <button class="av-enter" data-click="111">Enter</button>
      </div>
    </div>

    <!-- Subpage: DVD1 (d63) -->
    <div id="av-sub-dvd1" class="av-subpage">
      <div class="av-left-strip">
        <button class="av-btn" data-click="181">Home</button>
        <button class="av-btn" data-click="182">Top Menu</button>
        <button class="av-btn" data-click="183">Popup Menu</button>
        <button class="av-btn" data-click="184">Eject</button>
        <button class="av-btn" data-click="185">Return/Exit</button>
      </div>
      <div class="av-center-col">
        <div class="av-ch-cluster">
          <button class="av-ch-btn" data-click="126">▲</button>
          <span class="av-ch-label">Chapter/Trk</span>
          <button class="av-ch-btn" data-click="127">▼</button>
        </div>
        <div class="av-dpad-wrap">
          <div class="av-colored-btn av-red"    data-click="148"></div>
          <div class="av-colored-btn av-green"  data-click="149"></div>
          <div class="av-dpad">
            <button class="av-dpad-up"    data-click="120"></button>
            <button class="av-dpad-left"  data-click="122"></button>
            <button class="av-dpad-sel"   data-click="124">Select</button>
            <button class="av-dpad-right" data-click="123"></button>
            <button class="av-dpad-down"  data-click="121"></button>
          </div>
          <div class="av-colored-btn av-yellow" data-click="150"></div>
          <div class="av-colored-btn av-blue"   data-click="151"></div>
        </div>
        <div class="av-transport-row">
          <button class="av-transport-btn" data-click="127" title="Skip to Start">⏮</button>
          <button class="av-transport-btn" data-click="131" title="Rew">⏪</button>
          <button class="av-transport-btn" data-click="136" title="FFWD">⏩</button>
          <button class="av-transport-btn" data-click="126" title="Skip Fwd">⏭</button>
          <button class="av-transport-btn" data-click="132" title="Pause">⏸</button>
          <button class="av-transport-btn" data-click="134" title="Stop">⏹</button>
        </div>
      </div>
      <div class="av-numpad">
        <button data-click="100">1</button><button data-click="101">2</button><button data-click="102">3</button>
        <button data-click="103">4</button><button data-click="104">5</button><button data-click="105">6</button>
        <button data-click="106">7</button><button data-click="107">8</button><button data-click="108">9</button>
        <button data-click="112">_</button><button data-click="109">0</button>
        <button class="av-enter" data-click="111">Enter</button>
      </div>
    </div>

    <!-- Subpage: AppleTV (d67) -->
    <div id="av-sub-appletv" class="av-subpage av-sub-appletv">
      <div class="av-appletv-layout">
        <button class="av-btn av-menu-btn" data-click="142">Menu</button>
        <div class="av-dpad">
          <button class="av-dpad-up"    data-click="120"></button>
          <button class="av-dpad-left"  data-click="122"></button>
          <button class="av-dpad-sel"   data-click="124">Select</button>
          <button class="av-dpad-right" data-click="123"></button>
          <button class="av-dpad-down"  data-click="121"></button>
        </div>
        <div class="av-transport-row">
          <button class="av-transport-btn" data-click="133" title="Play/Pause">▶⏸</button>
          <button class="av-transport-btn" data-click="131" title="Rew">⏪</button>
          <button class="av-transport-btn" data-click="136" title="FFWD">⏩</button>
        </div>
      </div>
    </div>

  </div><!-- /.av-main -->

  <!-- Bottom bar: Rooms | [source name] [vol-] [vol%] [vol+] [mute] [power] | Sources -->
  <div class="av-bottom-bar">
    <div id="av-room-toggle" class="bar-btn">
      <i class="fas fa-bars"></i> Rooms
    </div>
    <div class="av-controls-strip">
      <span id="av-source-name" class="av-source-name"></span>
      <div id="av-vol-strip" class="av-vol-strip">
        <button class="av-vol-btn" id="av-vol-dn" data-hold="16">
          <i class="fas fa-volume-down"></i>
        </button>
        <span id="av-vol-pct" class="av-vol-pct">—</span>
        <button class="av-vol-btn" id="av-vol-up" data-hold="15">
          <i class="fas fa-volume-up"></i>
        </button>
        <button class="av-vol-btn" id="av-mute-btn" data-click="17">
          <i class="fas fa-volume-mute"></i>
        </button>
      </div>
      <button class="av-power-btn" id="av-power-btn" data-click="40">
        <i class="fas fa-power-off"></i>
      </button>
    </div>
    <div id="av-source-toggle" class="bar-btn">
      <i class="fas fa-list"></i> Sources
    </div>
  </div>

</div><!-- /#page-av -->
```

### 3. `app/services/av.js` — new file

**Responsibilities:**
- Render room buttons (17 rooms) and wire drawer open/close
- Render source buttons (24 sources) with icon+label and wire drawer open/close
- Subscribe to d60–d67 → show correct subpage div, hide others
- Subscribe to d21–d37 → room ON feedback (`.selected` class)
- Subscribe to s21–s37 → room name text
- Subscribe to d41–d59 → source selected feedback (`.selected` class)
- Subscribe to s81–s104 → source name text + visibility
- Subscribe to a41–a64 → source icon (via `iconForSource()`)
- Subscribe to s40 → update `#av-source-name`
- Subscribe to a1 → update vol % display; hide `#av-vol-strip` if value is 0
- Subscribe to d17 → mute feedback → toggle `.muted` on `#av-mute-btn`
- Subscribe to d40 → power feedback → toggle `.av-off` on `#av-power-btn`
- Wire all pulse buttons (`data-click`) with pointerdown pulse pattern
- Wire hold-high buttons (vol up/down) with pointerdown/pointerup/pointerleave
- Wire nav: AV tile on Home → `navTo('av')` (d4 already wired)
- Wire `d[14]` show/hide for AV tile on Home (already exists)

**Icon resolution function:**
```javascript
var SOURCE_ICON_MAP = {
  1: 'fa-satellite-dish',
  2: 'fa-satellite-dish',
  3: 'fa-brands fa-apple',
  4: 'fa-film',             // Kaleidescape
  5: 'fa-compact-disc',
};

function iconForSource(name, analogValue) {
  if (analogValue && analogValue !== 99) {
    return SOURCE_ICON_MAP[analogValue] || 'fa-tv';
  }
  var n = (name || '').toLowerCase();
  if (n.includes('directv'))                         return 'fa-satellite-dish';
  if (n.includes('comcast') || n.includes('xfinity')) return 'fa-satellite-dish';
  if (n.includes('apple'))                           return 'fa-brands fa-apple';
  if (n.includes('kaleidescape'))                    return 'fa-film';
  if (n.includes('dvd') || n.includes('blu'))        return 'fa-compact-disc';
  return 'fa-tv';
}
```

**Subpage switching:**
```javascript
var SUBPAGE_MAP = {
  60: 'av-sub-nocontrol',
  61: 'av-sub-sat1',
  62: 'av-sub-sat2',
  63: 'av-sub-dvd1',
  67: 'av-sub-appletv',
};

// Subscribe to d60-d67
for (var j = 60; j <= 67; j++) {
  (function(join) {
    CrComLib.subscribeState('b', String(join), function(val) {
      if (val !== true && val !== 'true') return;
      Object.values(SUBPAGE_MAP).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      var target = SUBPAGE_MAP[join];
      if (target) {
        var el = document.getElementById(target);
        if (el) el.classList.add('active');
      }
    });
  })(j);
}
```

### 4. `app/assets/theme/custom.css` — AV additions

New classes needed:

```
/* AV page layout */
.av-main              — flex container filling page (minus bottom bar)
.av-subpage           — position: absolute, fill av-main, hidden by default
.av-subpage.active    — visible subpage

/* Subpage inner layout */
.av-left-strip        — fixed-width left column, flex column of .av-btn
.av-center-col        — flex column: ch-cluster + dpad-wrap + transport-row
.av-numpad            — 3×4 grid, right side

/* D-pad */
.av-dpad              — CSS grid (3×3), circular gold center Select button
.av-dpad-up/dn/lt/rt  — directional arms, transparent bg, charcoal border
.av-dpad-sel          — center, gold fill, Cormorant label

/* Colored buttons */
.av-colored-btn       — 40px circle; .av-red/green/yellow/blue fills

/* Transport row */
.av-transport-row     — flex row, gap
.av-transport-btn     — charcoal-2 bg, gold icon/text on active

/* Numeric keypad */
.av-numpad button     — 52px circle, charcoal-2 bg, Jost, gold text
.av-enter             — wider pill button

/* Channel/Chapter cluster */
.av-ch-btn            — rounded square, charcoal-2
.av-ch-label          — muted serif label

/* Left strip */
.av-btn               — full-width, charcoal-2 bg, Jost, min-height 44px

/* Bottom bar */
.av-bottom-bar        — flex row, --nav-bg, fixed bottom, 56px
.av-controls-strip    — flex, center, gap; holds source-name + vol + power
.av-source-name       — Cormorant, gold, truncate overflow
.av-vol-strip         — flex row, gap; hidden when vol = 0
.av-vol-pct           — Cormorant serif, gold
.av-vol-btn           — circular, charcoal-2
.av-mute-btn.muted    — gold fill
.av-power-btn         — charcoal-2 normally; .av-off → red fill

/* Source drawer */
.av-source-btn        — flex row, icon + label; active = gold; hidden if name empty
.av-source-btn.selected — gold border + gold-lo fill

/* AppleTV centered layout */
.av-sub-appletv       — centered vertically + horizontally, generous spacing
```

---

## Build Steps (in order)

1. **joins.js** — add AV join constants block
2. **index.html** — add `#page-av` after `#page-climate`
3. **av.js** — new file in `app/services/`
4. **custom.css** — AV section at bottom
5. **Verify webpack** includes av.js (check `webpack.config.js` concat order — services files are glob-included, should auto-pick up)
6. **Home tile** — confirm d4/d14 wiring is live, nav routes to `av`
7. **Browser test** — `npm start`, use `emulateSignal` to:
   - Set room names, trigger room select
   - Set source names, trigger source select
   - Trigger each subpage type (d61–d63, d67)
   - Test vol hold, mute toggle, power feedback

---

## Deferred (Phase 4b)

- Kaleidescape subpage (d65) — dynamic graphics, soft buttons, metadata serial joins in `s[1201]`+ range, transport in `d[1201]`+ range
- DVD2 (d64) — identical to DVD1 layout, just different subpage type join; trivial addition when needed
