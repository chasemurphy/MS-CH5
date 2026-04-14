# Roadmap — MS-CH5 Crestron Panel

The PRD (`Reference/crestron-panel-prd.md`) defines what to build. This document sequences the work into phases. The custom join numbering scheme (not the PRD's fixed window) is authoritative — no refactor needed. Loads stay merged into the Lighting page.

## Current State

| Page | Status |
|------|--------|
| Home | Done |
| Music (v2) | Done |
| Lighting (scenes + loads) | Done |
| Shades | Done |
| Climate | Not started |
| AV | Not started |
| Responsive (TSW-1080) | Not started |
| Security | Future / out of scope |

---

## Phase 1 — Lighting Polish + Join Documentation

**Goal:** Get the partially-built Lighting page to a shippable state and lock down the real join map before more pages are wired.

- [x] Audit `page-lighting` and `lighting.js` against actual behavior; fix any known gaps
- [x] Write `Reference/join-map.md` documenting the actual custom join numbers (replaces PRD Section 6 as the SIMPL programmer's wiring doc)
- [x] Verify navigation routing covers Home → Lighting → Music; fix any broken nav transitions

**Key files:** `app/index.html`, `app/services/lighting.js`, `app/services/navigation.js`

---

## Phase 2 — Shades Page

**Goal:** Build the simplest remaining page as a template for the column-based layout pattern.

- [x] Add `id="page-shades"` to `index.html` — up to 10 horizontally-scrollable shade columns
- [x] Per column: shade name, Open/Close (pulse), Raise/Lower (hold high), Stop (pulse), position indicator (analog), % readout
- [x] Add `app/services/shades.js` — join subscriptions and event publishing
- [x] Wire Shades tile on Home page
- [x] Add shades styles to `custom.css`

**Join range:** Assign new block in `Reference/join-map.md` during Phase 1.

---

## Phase 3 — Climate Page

**Goal:** Build the thermostat page including the canvas arc dial.

- [ ] Add `id="page-climate"` to `index.html`
- [ ] Canvas arc dial: 280° sweep, current temp center display, setpoint dot + label
- [ ] Mode row: Heat / Cool / Auto / Off (pulse, digital feedback → gold active)
- [ ] Setpoint rows: Heat +/− and Cool +/− with analog readout
- [ ] Schedule card: Run / Hold / Away
- [ ] Fan card: Auto / On
- [ ] Add `app/services/climate.js`
- [ ] Wire Climate tile on Home page

**Note:** Canvas redraws on join change only — not every frame.

---

## Phase 4 — AV Page

**Goal:** Build the AV page with room drawer, source drawer, and per-source control panels.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Room]  [Source ▾]     Room / Source name      🔇 🔉 🔊  │  ← page header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         Source-specific controls (always visible)          │
│         e.g. D-pad, transport, camera grid, etc.           │
│                                                             │
│                                       [ Power Off ]        │
└─────────────────────────────────────────────────────────────┘

  Room drawer   — slides in from left (same pattern as Lighting)
  Source drawer — slides in (same pattern as Lighting scenes)
```

Theme: cream/charcoal/gold, consistent with all other pages.

### Header
- [ ] Room button (left) — opens room drawer; shows active room name
- [ ] Source button — opens source drawer; shows active source name + chevron
- [ ] Mute (pulse, gold when muted), Vol− / Vol+ (hold-high), volume % readout
- [ ] Power Off — always visible, danger red, pulse join

### Room Drawer (reuse Lighting room drawer pattern)
- [ ] Slides in from left with dark overlay
- [ ] Room buttons: name + current source (or "Off"); active room gold-highlighted
- [ ] Tap → pulse room-select join → drawer closes → header updates
- [ ] Room names + active feedback from serial/digital joins

### Source Drawer (reuse Lighting scenes panel pattern)
- [ ] Up to ~8 source buttons (icon + label); empty name = hidden; active = gold
- [ ] Tap → pulse source-select join → drawer closes → main area swaps

### Per-Source Control Panels

| Source | Controls |
|--------|----------|
| AppleTV / Streaming | D-pad + Select, Menu/Back, Play-Pause, Skip Back/Fwd |
| Kaleidescape | D-pad, Play-Pause, Skip, Chapter controls |
| Cable / Satellite | D-pad, Channel Up/Down, numeric keypad, Guide |
| Blu-ray / Media Player | D-pad, Play-Pause, Stop, Skip, Eject |
| Cameras | Camera channel select grid |
| Signage / Wallplate | Minimal — source selected, no transport |
| Game Console | Minimal |

### Services / JS
- [ ] Add `app/services/av.js` — room + source subscriptions, hold-high patterns
- [ ] Source panel swap logic: show/hide correct panel based on active source join
- [ ] Wire AV tile on Home page

---

## Phase 5 — Responsive Layout (TSW-1080)

**Goal:** All pages correct at 1920×1200, not just phone layout.

- [ ] `@media (min-width: 900px)` breakpoints in `custom.css`:
  - Home tile grid: 2-col → 3-col
  - Lighting load column: 110px → 130px
  - Shade column width scaling
  - Climate canvas sizing
  - AV D-pad sizing
  - Font scaling for large-format display
- [ ] Test all pages at 1920×1200 in Chrome device emulation

---

## Phase 6 — Future (Unscheduled)

- Security page
- Scheduler UI (lighting/shades schedules)
- Deploy script with panel IP (`build:deploy` in `package.json`)

---

## Testing Each Phase

`npm start` → localhost:3000 → use `emulateSignal()` in browser console to exercise joins.
TSW-1080: Chrome DevTools device emulation at 1920×1200.
Full build check: `npm run build:prod && npm run build:archive` → confirm `.ch5z` is produced.
