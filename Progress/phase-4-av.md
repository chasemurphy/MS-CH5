# Phase 4 — AV Page
**Completed:** see git log (`2e1fd3e`, `6a2aac2`, `93238a2`, `61a9965`, `0c8187b`, and this session's polish)

**Goal:** Build the AV page with room drawer, source drawer, subpage-based transport controls, and a clean volume/power UX on both iPhone and TSW-1080.

## Checklist

### Header
- [x] Home button (left) — navigates back to Home (shared with other pages)
- [x] Stacked title: room name (primary) + active source (secondary). Single line with em-dash on TSW; two-line stack on iPhone.
- [x] Volume pill (speaker icon + %) — tap to open volume drawer (phone) or rail (TSW). Gold fill when open, red icon when muted.

### Room Drawer (left slide-out)
- [x] Slides in from the left with dark overlay
- [x] 24 rooms (d21–d44 / s21–s44); hidden when name is empty
- [x] Two-line rows: room name (primary) + active source (secondary, muted, italic when off). Source pulled from s51–s74.
- [x] Tap → pulse room-select → drawer closes → header updates

### Source Drawer (right slide-out)
- [x] 24 sources (d51–d74 / s81–s104 / a41–a64 icon override)
- [x] Empty name = hidden; active = gold
- [x] **Power Off Room** row at the top of the drawer (red danger pill, d50)
- [x] Tap source → pulse select → drawer closes → subpage swaps

### Per-Source Subpages (swap based on d80–d87)
- [x] No Control (d80) — "No Source Selected" placeholder
- [x] DirecTV (d81) — full layout: left strip, channel cluster, d-pad, transport, numpad, 4 colored buttons
- [x] Comcast (d82) — XFinity variant with page up/down
- [x] DVD1 (d83) — home/menu/eject, chapter cluster, transport
- [x] AppleTV (d87) — minimal centered layout: menu + d-pad + transport
- [x] Kaleidescape / DVD2 deferred to Phase 4b

### Bottom Bar
- [x] Two floating pills: **Rooms** (left) and **Sources** (right), over the subpage
- [x] No Power Off on the bottom bar — moved into Sources drawer

### Services
- [x] `app/services/av.js` — room + source subscriptions, hold-high for vol, pulse for mute/power, subpage swap
- [x] Wire AV tile on Home page (d4 / d14)
- [x] Navigation shows/hides vol pill + AV title only on AV page

**Key files:** `app/index.html`, `app/services/av.js`, `app/services/navigation.js`, `app/assets/theme/custom.css`
**Join range:** Documented in `JOINS.md` and av.js header comment.

## Notes

- **Join map differs from original plan.** Final joins: vol up/down/mute on d97/d98/d99 (not d15-17), vol level on a11 (not a1), 24 rooms on d21–d44 (not 17), power off on d50 (not d40), source select on d51–d74 (not d41-59), subpages on d80–d87 (not d60-67). Per-room active source serials at s51–s74 added post-plan and wired to the two-line room drawer rows.
- **Volume is feedback-only on the slider.** Panel cannot publish analog; vol up/down use hold-high digital joins, mute uses pulse. The drawer/rail slider/fill is a readonly indicator driven by a11.
- **Two-layer volume UX.** Same header pill on both form factors: on iPhone it drops a full-width drawer under the header with mute / vol-down / vol-up buttons and a horizontal readonly fill bar; on TSW it slides in a right-edge rail with stacked vol-up / vol-down / mute buttons and a vertical readonly fill bar. Drawer is hidden above 899px, rail hidden below — toggle logic opens both blindly.
- **Title split into two elements.** `#header-title` remains for non-AV pages; AV uses a separate `#av-title` with `.av-title-room` / `.av-title-source` spans, stacked on mobile and inline with an em-dash on TSW. Navigation hides whichever isn't relevant.
- **Mockups kept** under `mockups/av-vol-*.html` for reference — the four volume variants the user evaluated before choosing the hybrid pill+drawer+rail approach.
- **FontAwesome v5 icon names** (`fa-volume-up` / `fa-volume-down`) — not FA6 names — because the bundled FA is 5.15.4.
