# Phase 3 — Climate Page
**Completed:** see git log (`6c0466d`, `f046deb`)

**Goal:** Build the thermostat page including the canvas arc dial.

## Checklist

- [x] Add `id="page-climate"` to `index.html`
- [x] Canvas arc dial: 280° sweep, current temp center display, setpoint dot + label
- [x] Mode row: Heat / Cool / Auto / Off (pulse, digital feedback → gold active)
- [x] Setpoint rows: Heat +/− and Cool +/− with analog readout
- [x] Schedule card: Run / Hold / Away
- [x] Fan card: Auto / On
- [x] Add `app/services/climate.js`
- [x] Wire Climate tile on Home page

**Key files:** `app/index.html`, `app/services/climate.js`, `app/assets/theme/custom.css`
**Join range:** Documented in `Reference/join-map.md`.

## Notes

Canvas arc dial redraws on join change only — not every frame. Press/feedback joins unified (single-auto pattern). Dial uses symmetric 280° sweep with min/max clamping.
