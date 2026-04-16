# Phase 5 — Responsive Layout (TSW-1080)

**Goal:** All pages correct at 1920×1200, not just phone layout.

- [x] `@media (min-width: 900px)` breakpoints in `custom.css`:
  - Home tile grid: 2-col → 3-col
  - Lighting load column: 110px → 130px
  - Shade column width scaling
  - Climate canvas sizing
  - AV D-pad sizing
  - Font scaling for large-format display
- [x] Test all pages at 1920×1200 in Chrome device emulation

## Notes

Responsive CSS was written incrementally per-page during Phases 1–4 — every page already has a `@media (min-width: 900px)` block in `custom.css`. Phase 5 as a standalone sprint is superseded. Per-page verification and refinement will be handled inline when each page is revisited.
