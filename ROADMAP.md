# Roadmap — MS-CH5 Crestron Panel

The PRD (`Reference/crestron-panel-prd.md`) defines what to build. This document sequences the work into phases. The custom join numbering scheme (not the PRD's fixed window) is authoritative — no refactor needed. Loads stay merged into the Lighting page.

## Status

| Page                      | Phase | Status                                        |
|---------------------------|-------|-----------------------------------------------|
| Home                      | —     | Done                                          |
| Music (v2)                | —     | Done                                          |
| Lighting (scenes + loads) | 1     | Done → [Progress/phase-1-lighting.md]         |
| Shades                    | 2     | Done → [Progress/phase-2-shades.md]           |
| Climate                   | 3     | Done → [Progress/phase-3-climate.md]          |
| AV                        | 4     | **Active**                                    |
| Responsive (TSW-1080)     | 5     | Planned                                       |
| Security                  | 6     | Future / out of scope                         |

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
