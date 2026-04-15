# Phase 1 — Lighting Polish + Join Documentation
**Completed:** see git log (`3a8985c`)

**Goal:** Get the partially-built Lighting page to a shippable state and lock down the real join map before more pages are wired.

## Checklist

- [x] Audit `page-lighting` and `lighting.js` against actual behavior; fix any known gaps
- [x] Write `Reference/join-map.md` documenting the actual custom join numbers (replaces PRD Section 6 as the SIMPL programmer's wiring doc)
- [x] Verify navigation routing covers Home → Lighting → Music; fix any broken nav transitions

**Key files:** `app/index.html`, `app/services/lighting.js`, `app/services/navigation.js`

## Notes

Join map locked here became the authoritative reference for all subsequent pages. Custom join numbering scheme (not the PRD's fixed window) established as the standard — no refactor needed going forward.
