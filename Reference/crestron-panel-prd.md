# Product Requirements Document
# Crestron HTML5 Home Control Panel

**Version:** 2.0  
**Status:** Ready for Development  
**Target:** Claude Code

---

## 1. Project Overview

A single HTML5 touchpanel file serving as the primary user interface for a residential Crestron home automation system. The panel deploys to both a **TSW-1080 touchpanel** (1920×1200) and the **Crestron iPhone app** from the same file, adapting layout responsively between targets.

### Core Architecture Principle — Crosspoint Switching

The panel always reads from a **fixed, small set of joins**. Room switching is handled entirely inside the SIMPL program using crosspoints. When the user selects "Family Room," the panel sends a single digital pulse to SIMPL; SIMPL's crosspoint matrix routes that room's scene names, load names, feedback levels, and active states into the panel's fixed join window. The panel never indexes by room — it always reads the same joins.

This means:
- Adding a new room requires zero changes to the HTML file
- The join map is small, readable, and easy to wire in SIMPL
- All state management logic lives in SIMPL where it belongs

---

## 2. Target Platforms

| Target | Resolution | Notes |
|--------|-----------|-------|
| TSW-1080 touchpanel | 1920 × 1200 | Deployed as `.ch5z` archive via `ch5-cli deploy` |
| Crestron iPhone app | Variable | Same file, responsive layout |

**Responsive breakpoint:** `@media (min-width: 900px)` — scales tile sizes, fonts, and button heights for the TSW-1080. Below 900px = compact phone layout.

---

## 3. Technology Stack

### Frontend
- **Single HTML file** — no build framework, no React, no Vue
- **Vanilla JS** — custom router, ES6 module pattern
- **CrComLib** (`window.CrComLib`) — all communication with SIMPL via joins
- **Canvas API** — thermostat arc dial
- **Google Fonts** — Cormorant Garamond (serif display) + Jost (geometric sans)
- **No external runtime dependencies**

### Crestron Integration
- **CrComLib + named join constants only** — no CH5 Contracts, no Contract Editor, no `.cse2j` file
- All join numbers defined once in a `JOIN` constants object at the top of the JS
- SIMPL programmer works from the join table in Section 6 of this document
- No REST API — all device control and feedback goes through SIMPL joins

### Build & Deploy
- **Toolchain:** Node.js, `@crestron/ch5-utilities-cli`, `@crestron/ch5-shell-utilities-cli`
- **Dev:** `npm run start` → localhost:3000, hot reload
- **Deploy:** `npm run build:onestep` → build → `.ch5z` archive → push to panel IP
- **Browser testing:** CrComLib shim + `emulateSignal()` helper included for dev without a processor

---

## 4. Visual Design

### Color Palette
```
--cream:       #f0ece3    page background
--cream-dark:  #e4dfd4    card / load column backgrounds
--cream-deep:  #d6d0c4    hover states, slider tracks
--charcoal:    #1c1c1c    header bar
--charcoal-2:  #2a2a2a    scene buttons, mode buttons, AV buttons
--charcoal-3:  #383838    subdued card buttons
--gold:        #c9a84c    primary accent — active states, titles, icons
--gold-hi:     #dbb85a    gold hover
--gold-lo:     #a8873a    active button fill
--nav-bg:      #181818    bottom navigation bar
```

### Typography
- **Cormorant Garamond** (serif) — page titles, thermostat readout, card labels, percentage readouts
- **Jost** (sans) — buttons, breadcrumbs, clock, nav labels, load names, source names

### Header Bar
- Background: `--charcoal`
- Bottom border: `1px solid rgba(201,168,76,0.2)`
- Title: gold (`--gold`), Cormorant Garamond
- Clock (home page only): 60% gold opacity, Jost
- On all room-context pages: room name from `s[51]` with gold `▾` chevron; tapping opens dropdown
- Breadcrumb below title: e.g. `Home › Lighting › Family Room` in muted gold

### Bottom Navigation Bar
- Background: `--nav-bg`
- Top border: `1px solid rgba(201,168,76,0.2)`
- Icon + label nav items: gray inactive, gold active
- Context text buttons: dark charcoal background, gold active state

### Active / Selected States
- Scene button active: `--gold-lo` fill + `--gold` border
- Load on (sun button): gold fill, dark icon
- Mode/fan/schedule button active: gold fill
- Nav item active: gold icon + gold label

---

## 5. Page Structure & Navigation

### Router
Vanilla JS custom router. Pages are `position: absolute` divs animating with `opacity` + `translateY`. SIMPL can drive navigation via serial join `s[50]`.

### Pages

| Page ID | Room-context | Header |
|---------|-------------|--------|
| `home` | No | "Home Control" + clock |
| `lighting` | Yes — scenes | Room name + `▾` |
| `loads` | Yes — individual dimmers | Room name + `▾` |
| `shades` | Yes — shade channels | Room name + `▾` |
| `climate` | Yes — thermostat | Room name + `▾` |
| `av` | Yes — sources + transport | Room name + `▾` |
| `music` | Future | — |
| `security` | Future | — |

### Bottom Nav — Context Per Page

| Page | Left button | Right button | Notes |
|------|------------|-------------|-------|
| `home` | hidden | hidden | Home icon only |
| `lighting` | Scheduler | Lights (gold) | Lights → loads view |
| `loads` | Scheduler | Scenes | Scenes → lighting view |
| `shades` | Scheduler | Groups | |
| `climate` | — | — | All Off, His Music, Her Music shortcuts |
| `av` | — | Source tabs | |

### Room Dropdown
- Appears on all room-context pages
- Triggered by tapping header room name/chevron
- Full-screen dark overlay, black panel slides from header
- Room list from `s[1]`–`s[30]` (empty string = hidden)
- Active room highlighted via `d[1]`–`d[30]` feedback
- On selection: pulse `d[201]`–`d[230]` corresponding to selected room
- SIMPL crosspoint fires → routes new room data into fixed join window → subscriptions fire → UI re-renders automatically

---

## 6. Signal Contract — Complete Join Map

> **This is the definitive wiring document for the SIMPL programmer.**
> All joins are fixed. SIMPL crosspoints map room-specific data into these joins on room select.
> The panel never indexes by room number — it always reads the same joins.

---

### 6.1 System — SIMPL → Panel

| Purpose | Type | Join | Notes |
|---------|------|------|-------|
| Room names | Serial | `s[1]` – `s[30]` | Static, sent at startup. Empty string = hidden in dropdown |
| Navigate command | Serial | `s[50]` | SIMPL sends page name: `"home"` `"lighting"` `"loads"` `"shades"` `"climate"` `"av"` |
| Active room name | Serial | `s[51]` | Sent by SIMPL after crosspoint switch — displayed in header |
| Active room feedback | Digital | `d[1]` – `d[30]` | Which room is highlighted in dropdown |

### 6.2 Room Selection — Panel → SIMPL

| Purpose | Type | Join | Notes |
|---------|------|------|-------|
| Select room 1–30 | Digital | `d[201]` – `d[230]` | Pulse on tap. d[201]=room 1, d[202]=room 2, etc. |
| Home button | Digital | `d[200]` | Pulse |

---

### 6.3 Lighting Scenes — Fixed Window (SIMPL → Panel)

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Scene names | Serial | `s[101]` – `s[112]` | 12 scenes max. Empty = button hidden |
| Scene active feedback | Digital | `d[101]` – `d[112]` | High = active scene (gold button) |

### 6.4 Lighting Scenes — Panel → SIMPL

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Scene 1–12 press | Digital | `d[301]` – `d[312]` | Pulse on tap |

---

### 6.5 Lighting Loads — Fixed Window (SIMPL → Panel)

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Load names | Serial | `s[121]` – `s[144]` | 24 loads max. Empty = column hidden |
| Load level feedback | Analog | `a[101]` – `a[124]` | 0–65535. Drives slider + % readout |
| Load on/off feedback | Digital | `d[121]` – `d[144]` | High = on (sun button gold) |

### 6.6 Lighting Loads — Panel → SIMPL

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Load 1–24 toggle | Digital | `d[321]` – `d[344]` | Pulse — SIMPL toggles on/off |
| Load 1–24 raise | Digital | `d[401]` – `d[424]` | **Hold high** while held, low on release |
| Load 1–24 lower | Digital | `d[425]` – `d[448]` | **Hold high** while held, low on release |
| Load 1–24 full on | Digital | `d[449]` – `d[472]` | Pulse — SIMPL sets to 100% |

---

### 6.7 Shades — Fixed Window (SIMPL → Panel)

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Shade names | Serial | `s[151]` – `s[160]` | 10 shades max. Empty = hidden |
| Shade position | Analog | `a[151]` – `a[160]` | 0–65535. 0 = closed, 65535 = open |
| Shade moving feedback | Digital | `d[151]` – `d[160]` | High = shade in motion |

### 6.8 Shades — Panel → SIMPL

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Shade 1–10 open | Digital | `d[501]` – `d[510]` | Pulse |
| Shade 1–10 close | Digital | `d[511]` – `d[520]` | Pulse |
| Shade 1–10 stop | Digital | `d[521]` – `d[530]` | Pulse |
| Shade 1–10 raise | Digital | `d[531]` – `d[540]` | Hold high while pressed |
| Shade 1–10 lower | Digital | `d[541]` – `d[550]` | Hold high while pressed |

---

### 6.9 Climate — Fixed Window (SIMPL → Panel)

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Thermostat name | Serial | `s[171]` | Name for current room's thermostat |
| System mode | Serial | `s[172]` | `"Heat"` `"Cool"` `"Auto"` `"Off"` |
| Fan mode | Serial | `s[173]` | `"Auto"` `"On"` |
| Schedule state | Serial | `s[174]` | `"Run"` `"Hold"` `"Away"` |
| Current temperature | Analog | `a[171]` | ×10 scale — 730 = 73.0°F |
| Heat setpoint | Analog | `a[172]` | ×10 scale |
| Cool setpoint | Analog | `a[173]` | ×10 scale |
| Mode feedback | Digital | `d[171]` – `d[174]` | Heat / Cool / Auto / Off (one high at a time) |
| Fan feedback | Digital | `d[175]` – `d[176]` | Auto / On |
| Schedule feedback | Digital | `d[177]` – `d[179]` | Run / Hold / Away |

### 6.10 Climate — Panel → SIMPL

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Heat setpoint up | Digital | `d[601]` | Pulse |
| Heat setpoint down | Digital | `d[602]` | Pulse |
| Cool setpoint up | Digital | `d[603]` | Pulse |
| Cool setpoint down | Digital | `d[604]` | Pulse |
| Set mode: Heat | Digital | `d[605]` | Pulse |
| Set mode: Cool | Digital | `d[606]` | Pulse |
| Set mode: Auto | Digital | `d[607]` | Pulse |
| Set mode: Off | Digital | `d[608]` | Pulse |
| Set fan: Auto | Digital | `d[609]` | Pulse |
| Set fan: On | Digital | `d[610]` | Pulse |
| Set schedule: Run | Digital | `d[611]` | Pulse |
| Set schedule: Hold | Digital | `d[612]` | Pulse |
| Set schedule: Away | Digital | `d[613]` | Pulse |

---

### 6.11 AV — Fixed Window (SIMPL → Panel)

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Source names | Serial | `s[181]` – `s[188]` | 8 sources max. Empty = hidden |
| Now playing / label | Serial | `s[189]` | Optional display string |
| Active source feedback | Digital | `d[181]` – `d[188]` | High = this source selected (gold) |
| System power state | Digital | `d[189]` | High = system on |
| Mute state | Digital | `d[190]` | High = muted |
| Volume level | Analog | `a[181]` | 0–65535 |

### 6.12 AV — Panel → SIMPL

| Purpose | Type | Joins | Notes |
|---------|------|-------|-------|
| Source 1–8 select | Digital | `d[701]` – `d[708]` | Pulse |
| Volume up | Digital | `d[709]` | Hold high while pressed |
| Volume down | Digital | `d[710]` | Hold high while pressed |
| Mute toggle | Digital | `d[711]` | Pulse |
| Power toggle | Digital | `d[712]` | Pulse |
| D-pad up | Digital | `d[713]` | Pulse |
| D-pad down | Digital | `d[714]` | Pulse |
| D-pad left | Digital | `d[715]` | Pulse |
| D-pad right | Digital | `d[716]` | Pulse |
| D-pad select | Digital | `d[717]` | Pulse |
| Play / Pause | Digital | `d[718]` | Pulse |
| Skip back | Digital | `d[719]` | Pulse |
| Skip forward | Digital | `d[720]` | Pulse |
| Menu / Back | Digital | `d[721]` | Pulse |
| Source home | Digital | `d[722]` | Pulse |

---

### 6.13 Complete Join Range Summary

| Block | Type | Range | Count |
|-------|------|-------|-------|
| Room names | Serial | `s[1]`–`s[30]` | 30 |
| Nav + active room | Serial | `s[50]`–`s[51]` | 2 |
| Scene names | Serial | `s[101]`–`s[112]` | 12 |
| Load names | Serial | `s[121]`–`s[144]` | 24 |
| Shade names | Serial | `s[151]`–`s[160]` | 10 |
| Climate serials | Serial | `s[171]`–`s[174]` | 4 |
| AV source names + label | Serial | `s[181]`–`s[189]` | 9 |
| Load levels | Analog | `a[101]`–`a[124]` | 24 |
| Shade positions | Analog | `a[151]`–`a[160]` | 10 |
| Climate temps | Analog | `a[171]`–`a[173]` | 3 |
| Volume | Analog | `a[181]` | 1 |
| Room active feedback | Digital | `d[1]`–`d[30]` | 30 |
| Scene active feedback | Digital | `d[101]`–`d[112]` | 12 |
| Load on/off feedback | Digital | `d[121]`–`d[144]` | 24 |
| Shade moving feedback | Digital | `d[151]`–`d[160]` | 10 |
| Climate mode/fan/sched FB | Digital | `d[171]`–`d[179]` | 9 |
| AV source + power + mute FB | Digital | `d[181]`–`d[190]` | 10 |
| Home button | Digital | `d[200]` | 1 |
| Room select pulses | Digital | `d[201]`–`d[230]` | 30 |
| Scene press | Digital | `d[301]`–`d[312]` | 12 |
| Load toggle | Digital | `d[321]`–`d[344]` | 24 |
| Load raise (hold) | Digital | `d[401]`–`d[424]` | 24 |
| Load lower (hold) | Digital | `d[425]`–`d[448]` | 24 |
| Load full on | Digital | `d[449]`–`d[472]` | 24 |
| Shade open/close/stop/raise/lower | Digital | `d[501]`–`d[550]` | 50 |
| Climate control | Digital | `d[601]`–`d[613]` | 13 |
| AV control | Digital | `d[701]`–`d[722]` | 22 |

**Total unique joins: ~100 serial/analog + ~320 digital**

---

## 7. Page Specifications

### 7a. Home Page
- Gold serif headline: "Home Control"
- Muted subtitle: "Select a system"
- 2-column grid (phone) / 3-column grid (TSW-1080)
- Tiles: **Lighting**, **Climate**, **Shades**, **AV**, **Music**, **Security**
- Default tile: cream-dark background, charcoal border, dark icon + label
- Active/selected tile: gold border, white background, gold icon

### 7b. Lighting Scenes Page
- Page title: `[s[51]] Lighting` — uppercase serif
- 2-column grid of up to 12 scene buttons
- Button: charcoal-2 background, white uppercase label
- Active (`d[101]`–`d[112]` high): gold-lo fill, gold border
- Empty name (`s[101]`–`s[112]` = `""`) = button not rendered
- Tap: pulse `d[301]`–`d[312]`

### 7c. Lighting Loads Page
- Page title: `[s[51]] Control` — serif
- Horizontally scrollable columns, one per active load
- Column width: 110px (phone), 130px (TSW-1080)
- Empty load name = column not rendered
- **Per load column (top to bottom):**
  1. Load name label (Jost, muted)
  2. Circular full-brightness button — gold when on (`d[121]`–`d[144]`), charcoal when off. Tap: pulse `d[449]`–`d[472]`
  3. Up arrow — `pointerdown` holds `d[401]`–`d[424]` high; `pointerup/leave` releases
  4. Vertical slider track — gold fill + gold thumb at `a[101]`–`a[124]` position
  5. Down arrow — holds `d[425]`–`d[448]`
  6. Off/power button (small) — pulse `d[321]`–`d[344]`
  7. Percentage readout — large gold serif (level ÷ 655.35, rounded to integer)

### 7d. Shades Page
- Page title: `[s[51]] Shades` — serif
- Up to 10 shade columns, horizontally scrollable
- **Per shade column:**
  1. Shade name (`s[151]`–`s[160]`)
  2. Open button — pulse `d[501]`–`d[510]`
  3. Raise button (hold) — `d[531]`–`d[540]`
  4. Vertical position indicator (read-only, driven by `a[151]`–`a[160]`)
  5. Lower button (hold) — `d[541]`–`d[550]`
  6. Close button — pulse `d[511]`–`d[520]`
  7. Stop button — pulse `d[521]`–`d[530]`
  8. "Moving" animation indicator when `d[151]`–`d[160]` high
  9. Position % readout

### 7e. Climate Page
- Page title: thermostat name from `s[171]`
- **Arc dial** on `<canvas>` (260×200px):
  - 280° sweep, dark track, gold fill to setpoint dot
  - Gold dot at cool setpoint, degree label alongside
  - Center: "Current temp is X°" + large gold serif setpoint value
  - Current temp from `a[171]` ÷ 10; setpoint from `a[173]` ÷ 10
- **Mode buttons** (4 across): Heat | Cool | Auto | Off
  - Feedback: `d[171]`–`d[174]`; active = gold
  - Press: `d[605]`–`d[608]`
- **Setpoint rows:**
  - Heat: `−` (`d[602]`) | value from `a[172]`÷10 | `+` (`d[601]`)
  - Cool: `−` (`d[604]`) | value from `a[173]`÷10 | `+` (`d[603]`)
- **Schedule card**: Run/Hold/Away — feedback `d[177]`–`d[179]`; press `d[611]`–`d[613]`
- **Fan card**: Auto/On — feedback `d[175]`–`d[176]`; press `d[609]`–`d[610]`

### 7f. AV Page
- Page title: `[s[51]] AV` — serif
- **Source buttons** (up to 8): names from `s[181]`–`s[188]`
  - Active feedback `d[181]`–`d[188]`; tap: pulse `d[701]`–`d[708]`
  - Empty name = button hidden
- **D-pad** — large circular gold control, center Select
  - Up/Down/Left/Right: `d[713]`–`d[716]`; Select: `d[717]`
  - Menu/Back: `d[721]`; Source Home: `d[722]`
- **Transport row**: Play/Pause `d[718]`, Skip Back `d[719]`, Skip Fwd `d[720]`
- **Volume**: +/- buttons holding `d[709]`/`d[710]`, level display from `a[181]`
- **Mute button**: feedback `d[190]`, press `d[711]`; gold when muted
- **Power button**: feedback `d[189]`, press `d[712]`; red when off

---

## 8. JS Architecture

### JOIN Constants Object
```javascript
const JOIN = {
  // System
  ROOM_NAMES_S:    { start: 1,   count: 30 },
  NAV_CMD_S:       50,
  ACTIVE_ROOM_S:   51,
  ROOM_ACTIVE_D:   { start: 1,   count: 30 },
  HOME_BTN_D:      200,
  ROOM_SELECT_D:   { start: 201, count: 30 },

  // Scenes
  SCENE_NAMES_S:   { start: 101, count: 12 },
  SCENE_ACTIVE_D:  { start: 101, count: 12 },
  SCENE_PRESS_D:   { start: 301, count: 12 },

  // Loads
  LOAD_NAMES_S:    { start: 121, count: 24 },
  LOAD_LEVEL_A:    { start: 101, count: 24 },
  LOAD_ON_D:       { start: 121, count: 24 },
  LOAD_TOGGLE_D:   { start: 321, count: 24 },
  LOAD_RAISE_D:    { start: 401, count: 24 },
  LOAD_LOWER_D:    { start: 425, count: 24 },
  LOAD_FULL_D:     { start: 449, count: 24 },

  // Shades
  SHADE_NAMES_S:   { start: 151, count: 10 },
  SHADE_POS_A:     { start: 151, count: 10 },
  SHADE_MOVING_D:  { start: 151, count: 10 },
  SHADE_OPEN_D:    { start: 501, count: 10 },
  SHADE_CLOSE_D:   { start: 511, count: 10 },
  SHADE_STOP_D:    { start: 521, count: 10 },
  SHADE_RAISE_D:   { start: 531, count: 10 },
  SHADE_LOWER_D:   { start: 541, count: 10 },

  // Climate
  TSTAT_NAME_S:    171,
  TSTAT_MODE_S:    172,
  TSTAT_FAN_S:     173,
  TSTAT_SCHED_S:   174,
  TSTAT_TEMP_A:    171,
  TSTAT_HEAT_A:    172,
  TSTAT_COOL_A:    173,
  TSTAT_MODE_D:    { start: 171, count: 4 },
  TSTAT_FAN_D:     { start: 175, count: 2 },
  TSTAT_SCHED_D:   { start: 177, count: 3 },
  HEAT_UP_D:  601, HEAT_DN_D:  602,
  COOL_UP_D:  603, COOL_DN_D:  604,
  MODE_HEAT_D:605, MODE_COOL_D:606, MODE_AUTO_D:607, MODE_OFF_D:608,
  FAN_AUTO_D: 609, FAN_ON_D:   610,
  SCHED_RUN_D:611, SCHED_HOLD_D:612, SCHED_AWAY_D:613,

  // AV
  SOURCE_NAMES_S:  { start: 181, count: 8 },
  NOW_PLAYING_S:   189,
  SOURCE_ACTIVE_D: { start: 181, count: 8 },
  POWER_FB_D:      189,
  MUTE_FB_D:       190,
  VOL_LEVEL_A:     181,
  SOURCE_SEL_D:    { start: 701, count: 8 },
  VOL_UP_D:   709, VOL_DN_D:   710,
  MUTE_D:     711, POWER_D:    712,
  DPAD_UP_D:  713, DPAD_DN_D:  714,
  DPAD_LT_D:  715, DPAD_RT_D:  716,
  DPAD_SEL_D: 717,
  PLAY_D:     718, SKIP_BACK_D:719, SKIP_FWD_D:720,
  MENU_D:     721, SRC_HOME_D: 722,
};
```

### Key Patterns

**Subscribe to a fixed block on startup:**
```javascript
for (let i = 0; i < JOIN.SCENE_NAMES_S.count; i++) {
  CrComLib.subscribeState('s', String(JOIN.SCENE_NAMES_S.start + i), val => {
    state.scenes[i] = val || '';
    if (state.currentPage === 'lighting') renderSceneButton(i);
  });
}
```

**Room select — one pulse, SIMPL does the rest:**
```javascript
function selectRoom(index) {       // 0-based
  state.currentRoom = index;
  const j = JOIN.ROOM_SELECT_D.start + index;
  CrComLib.publishEvent('b', String(j), true);
  CrComLib.publishEvent('b', String(j), false);
  // SIMPL crosspoint fires → all fixed joins update → subscriptions re-render UI
}
```

**Hold pattern (raise/lower, volume):**
```javascript
btn.addEventListener('pointerdown', () =>
  CrComLib.publishEvent('b', String(JOIN.LOAD_RAISE_D.start + i), true));
btn.addEventListener('pointerup',    () =>
  CrComLib.publishEvent('b', String(JOIN.LOAD_RAISE_D.start + i), false));
btn.addEventListener('pointerleave', () =>
  CrComLib.publishEvent('b', String(JOIN.LOAD_RAISE_D.start + i), false));
```

**SIMPL-driven navigation:**
```javascript
CrComLib.subscribeState('s', String(JOIN.NAV_CMD_S), val => {
  if (val) navTo(val.toLowerCase().trim());
});
```

---

## 9. File Structure

```
project-root/
├── app/
│   ├── project-config.json
│   └── project/
│       ├── components/
│       │   └── pages/
│       │       ├── home/        (home.html, home.scss, home.js)
│       │       ├── lighting/
│       │       ├── loads/
│       │       ├── shades/
│       │       ├── climate/
│       │       └── av/
│       ├── services/
│       │   └── joins.js         ← JOIN constants + subscribeAll()
│       └── assets/
│           └── theme/
│               └── custom.css   ← CSS variables, global styles
├── package.json
└── dist/
    └── prod/
        └── shell-template.ch5z
```

**Starting point:** `panel-gold.html` — complete single-file prototype with all visual design, routing, and CrComLib wiring pattern. Refactor into the structure above preserving all design decisions exactly.

---

## 10. Build & Deploy

```bash
npm run start           # Dev server localhost:3000, hot reload
npm run build:prod      # Production build → dist/
npm run build:archive   # .ch5z archive
npm run build:deploy    # Push to panel
npm run build:onestep   # All of the above sequentially
```

**Set panel IP in `package.json`:**
```json
"build:deploy": "ch5-cli deploy -H 192.168.x.x -t touchscreen -p dist/prod/shell-template.ch5z"
```

---

## 11. Browser Dev / Testing

CrComLib shim activates when `window.CrComLib` is absent. Exposes `emulateSignal()`:

```javascript
emulateSignal('s', 1,   'Family Room')   // room 1 name
emulateSignal('s', 51,  'Family Room')   // active room name → header
emulateSignal('s', 101, 'All On')        // scene 1 name
emulateSignal('b', 101, true)            // scene 1 active
emulateSignal('n', 101, 43000)           // load 1 at ~65%
emulateSignal('b', 121, true)            // load 1 on
emulateSignal('n', 171, 730)             // thermostat 73.0°F
emulateSignal('b', 201, true)            // simulate room 1 select
```

**Chrome emulation sizes:**

| Device | Width | Height |
|--------|-------|--------|
| TSW-1080 | 1920 | 1200 |
| TSW-770 | 1280 | 800 |
| iPhone 14 | 390 | 844 |

---

## 12. Out of Scope — Future Phases

- Music page (multi-zone audio, vertical faders, source buttons)
- Security page
- Scheduler UI
- SIMPL program (separate project — SIMPL programmer wires crosspoints using join table in Section 6)

---

## 13. Open Questions for Developer

1. **Panel IP** — set in `package.json` deploy script before first deploy
2. **Thermostat scale** — confirm ×10 Fahrenheit whole degrees (730 = 73.0°F)
3. **Shade convention** — confirm 0 = closed / 65535 = open (vs reversed)
4. **24 loads on TSW-1080** — horizontal scroll is specified; confirm whether a 2-row grid (12 per row) is preferred for the wide touchpanel format
5. **AV additional buttons** — confirm whether 8 sources and standard transport covers all rooms, or if certain rooms need custom buttons (discrete input select, aspect ratio, etc.)

---

*Version 2.0 — Crosspoint architecture. No REST API. Fixed join window. Covers lighting, loads, shades, climate, and AV. All join numbers final.*
