# Roadmap — MS-CH5 Crestron Panel

The PRD (`Reference/crestron-panel-prd.md`) defines what to build. This document sequences the work into phases. The custom join numbering scheme (not the PRD's fixed window) is authoritative — no refactor needed. Loads stay merged into the Lighting page.

## Status

| Page                       | Phase | Status                                        |
|----------------------------|-------|-----------------------------------------------|
| Home                       | —     | Done                                          |
| Music (v2)                 | —     | Done                                          |
| Lighting (scenes + loads)  | 1     | Done → [Progress/phase-1-lighting.md]         |
| Shades                     | 2     | Done → [Progress/phase-2-shades.md]           |
| Climate                    | 3     | Done → [Progress/phase-3-climate.md]          |
| AV                         | 4     | Done → [Progress/phase-4-av.md]               |
| Responsive (TSW-1080)      | 5     | Done → [Progress/phase-5-responsive.md]       |
| Video source pages         | 6     | Pending — finalize Blu-ray + Kaleidescape     |
| Door Locks                 | 7     | Pending                                       |
| Garage / Gate              | 8     | Pending                                       |
| Parental Controls          | 9     | Pending                                       |
| System                     | 10    | Pending                                       |
| Tech Page (hidden)         | 11    | Pending — technician troubleshooting          |
| Scheduler UI               | 12    | Pending — lighting/shades schedules           |
| Security                   | 13    | Pending                                       |

---

## Phase 6 — Finalize Video Source Pages

- Blu-ray source page
- Kaleidescape source page
- Match existing source-page pattern from AV (DirecTV/Comcast/DVD1/AppleTV)

## Phase 7 — Door Locks

- Door Locks page

## Phase 8 — Garage / Gate

- Garage and Gate control page

## Phase 9 — Parental Controls

- Parental Controls page

## Phase 10 — System

- System page

## Phase 11 — Tech Page (Hidden)

- Hidden technician troubleshooting page
- Entry via a reserved/hidden gesture (pattern TBD — likely a `Csig.Enter_*` signal similar to the existing `Csig.Enter_Setup` tap zone on Home)

## Phase 12 — Scheduler UI

- Scheduler UI for lighting and shades schedules

## Phase 13 — Security

- Security page (per PRD)

---

## Testing Each Phase

`npm start` → localhost:3000 → use `emulateSignal()` in browser console to exercise joins.
TSW-1080: Chrome DevTools device emulation at 1920×1200.
Full build check: `npm run build:prod && npm run build:archive` → confirm `.ch5z` is produced.
