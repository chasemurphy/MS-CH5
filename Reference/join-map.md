# MS-CH5 Join Map

Authoritative join reference for the SIMPL programmer. Replaces PRD Section 6.
All joins extracted from `app/index.html` and `app/services/*.js`.

**Direction key:** P→S = panel sends to SIMPL, S→P = SIMPL sends to panel, P↔S = both

---

## Global / System

| Join | Type | Dir | Description |
|------|------|-----|-------------|
| b[200] | Digital | P↔S | Home nav button press (P→S); SIMPL echoes back (S→P) |
| n[1] | Analog | S→P | Theme index: 0 = light, 1 = dark, 2 = custom |
| s[1] | Serial | S→P | Header bar title text |

---

## Home Page

| Join | Type | Dir | Description |
|------|------|-----|-------------|
| b[1] | Digital | P↔S | Lighting tile press + selected feedback |
| b[2] | Digital | P↔S | Climate tile press + selected feedback |
| b[3] | Digital | P↔S | Shades tile press + selected feedback |
| b[4] | Digital | P↔S | AV tile press + selected feedback |
| b[5] | Digital | P↔S | Music tile press + selected feedback |
| b[6] | Digital | P↔S | Security tile press + selected feedback |
| b[7] | Digital | P↔S | System tile press + selected feedback |
| b[8] | Digital | P↔S | Access tile press + selected feedback |
| b[11] | Digital | S→P | Lighting tile show/hide |
| b[12] | Digital | S→P | Climate tile show/hide |
| b[13] | Digital | S→P | Shades tile show/hide |
| b[14] | Digital | S→P | AV tile show/hide |
| b[15] | Digital | S→P | Music tile show/hide |
| b[16] | Digital | S→P | Security tile show/hide |
| b[17] | Digital | S→P | System tile show/hide |
| b[18] | Digital | S→P | Access tile show/hide |

---

## Lighting Page

### Header
| Join | Type | Dir | Description |
|------|------|-----|-------------|
| s[600] | Serial | S→P | Current room name; JS appends " Lighting" to form the header title |

### Room Drawer (31 rooms, joins 651–681)

| Join | Type | Dir | Description |
|------|------|-----|-------------|
| s[641–671] | Serial | S→P | Room names (641 = room 1 … 671 = room 31) |
| b[651–681] | Digital | P↔S | Room select pulse (P→S); selected highlight feedback (S→P) |
| b[781–811] | Digital | S→P | Lights-on indicator per room — icon highlights gold |
| b[1541–1571] | Digital | S→P | Room row visible/hidden (1541 = room 1 … 1571 = room 31) |

### Loads (20 loads per room, crosspoint-driven by SIMPL)

| Join | Type | Dir | Description |
|------|------|-----|-------------|
| s[601–620] | Serial | S→P | Load names (empty = card hidden from view) |
| b[701–720] | Digital | P↔S | Load on/off toggle (P→S); on/off state feedback (S→P) |
| n[701–720] | Analog | P↔S | Load dimmer level 0–65535 |
| b[721–740] | Digital | P→S | Raise — hold-high while raise button held |
| b[741–760] | Digital | P→S | Lower — hold-high while lower button held |
| b[821–840] | Digital | P→S | Slider drag gate — high while user is dragging the slider; SIMPL should gate analog passthrough on this join to prevent snap-back |

### Scenes (12 scenes per room)

| Join | Type | Dir | Description |
|------|------|-----|-------------|
| s[621–632] | Serial | S→P | Scene names (empty = button hidden) |
| b[761–772] | Digital | P↔S | Scene press (P→S); active scene feedback (S→P) |

---

## Music Page

Room columns are wired via `data-` attributes in `index.html`. Eight rooms, each with 5 source slots.

### Per-Room Joins

| Room | Name join | Volume analog | Vol drag gate | Vol up | Vol down | Zone off |
|------|-----------|---------------|--------------|--------|----------|---------|
| 1 | s[401] | n[401] | b[408] | b[406] | b[407] | b[420] |
| 2 | s[407] | n[402] | b[418] | b[416] | b[417] | b[430] |
| 3 | s[413] | n[403] | b[428] | b[426] | b[427] | b[440] |
| 4 | s[419] | n[404] | b[438] | b[436] | b[437] | b[450] |
| 5 | s[425] | n[405] | b[448] | b[446] | b[447] | b[460] |
| 6 | s[437] | n[406] | b[458] | b[456] | b[457] | b[470] |
| 7 | s[449] | n[409] | b[488] | b[486] | b[487] | b[490] |
| 8 | s[461] | n[411] | b[508] | b[506] | b[507] | b[510] |

Vol drag gate: high while slider is dragging (same gating pattern as lighting loads).
Vol up/down: hold-high while button held.

### Per-Room Source Buttons (5 sources per room)

| Room | Src 1 click/label | Src 2 click/label | Src 3 click/label | Src 4 click/label | Src 5 click/label |
|------|-----------------|-----------------|-----------------|-----------------|-----------------|
| 1 | b[401] / s[402] | b[402] / s[403] | — | b[404] / s[405] | b[405] / s[406] |
| 2 | b[411] / s[408] | b[412] / s[409] | b[413] / s[410] | b[414] / s[411] | b[415] / s[412] |
| 3 | b[421] / s[414] | b[422] / s[415] | b[423] / s[416] | b[424] / s[417] | b[425] / s[418] |
| 4 | b[431] / s[420] | b[432] / s[421] | b[433] / s[422] | b[434] / s[423] | b[435] / s[424] |
| 5 | b[441] / s[426] | b[442] / s[427] | b[443] / s[428] | b[444] / s[429] | b[445] / s[430] |
| 6 | b[451] / s[438] | b[452] / s[439] | b[453] / s[440] | b[454] / s[441] | — |
| 7 | b[461] / s[450] | — | — | — | b[485] / s[454] |
| 8 | b[491] / s[456] | — | — | — | — |

Source click joins: pulse P→S + selected state feedback S→P. Label joins: S→P serial; empty = button hidden.

### Music Global

| Join | Type | Dir | Description |
|------|------|-----|-------------|
| b[301] | Digital | P↔S | Media panel toggle + state feedback |
| b[400] | Digital | P→S | All rooms off |
| s[400] | Serial | S→P | Current room name → header title on Music page |

---

## Reserved Blocks (unassigned — for future phases)

| Block | Reserved for |
|-------|-------------|
| b[841–900], n[841–860], s[841–860] | Phase 2 — Shades |
| b[901–970], n[901–910], s[901–910] | Phase 3 — Climate |
| b[971–1100], n[971–980], s[961–980] | Phase 4 — AV |
