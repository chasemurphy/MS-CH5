# Phase 2 — Shades Page
**Completed:** see git log (`5be3a06`)

**Goal:** Build the simplest remaining page as a template for the column-based layout pattern.

## Checklist

- [x] Add `id="page-shades"` to `index.html` — up to 10 horizontally-scrollable shade columns
- [x] Per column: shade name, Open/Close (pulse), Raise/Lower (hold high), Stop (pulse), position indicator (analog), % readout
- [x] Add `app/services/shades.js` — join subscriptions and event publishing
- [x] Wire Shades tile on Home page
- [x] Add shades styles to `custom.css`

**Key files:** `app/index.html`, `app/services/shades.js`, `app/assets/theme/custom.css`
**Join range:** Documented in `Reference/join-map.md`.

## Notes

Established the horizontally-scrollable column layout pattern reused by Lighting and used as reference for future pages.
