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
| AV                        | 4     | Done → [Progress/phase-4-av.md]               |
| Responsive (TSW-1080)     | 5     | **Active**                                    |
| Security                  | 6     | Future / out of scope                         |

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
