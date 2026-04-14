# MS-CH5 Join List

All joins are verified against `app/index.html` and `app/services/*.js`. Analog values use the CH5 0–65535 scale unless noted. Temperature joins are ×10 integer (e.g. `720` = 72.0 °F).

Direction:
- **→** Panel → SIMPL (the panel emits this)
- **←** SIMPL → Panel (the panel listens to this)
- **↔** Bidirectional (slider-style)

---

## Global / Header

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| s | 1 | ← | Header title text (default binding on `<ch5-text id="header-title">`) — individual pages override this on room changes |
| n | 1 | ← | Theme selector: `0` = light, `1` = dark, `2` = custom |

Each page service overrides the header when its room-name serial updates:
- Lighting → reads `s600`, writes `"{room} Lighting"`
- Shades → reads `s851`, writes `"{room} Shades"`
- Climate → reads `s961`, writes `"{room} Climate"`
- Music → reads `s400`, writes `{room}`

---

## Navigation

| Type | # | Dir | Purpose |
|------|---|-----|---------|
| b | 1 | ↔ | Lighting tile press / feedback / show-page trigger |
| b | 2 | ↔ | Climate tile press / feedback / show-page trigger |
| b | 3 | ↔ | Shades tile press / feedback / show-page trigger |
| b | 4 | ↔ | AV tile press / feedback |
| b | 5 | ↔ | Music tile press / feedback / show-page trigger |
| b | 6 | ↔ | Security tile press / feedback |
| b | 7 | ↔ | System tile press / feedback |
| b | 8 | ↔ | Access tile press / feedback |
| b | 11–18 | ← | Home tile show/hide (one per tile above, offset +10) |
| b | 200 | ↔ | Home nav button press / nav-to-home trigger |

Page-change rule: when SIMPL latches `d1/d2/d3/d5/d200` high, the panel switches to that page.

---

## Home Page

No additional joins beyond the nav block above.

---

## Lighting Page

### Loads (20 loads)
Per load N (1–20), base digital = 700 + N, base analog = 700 + N, base serial = 600 + N.

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| b | 701–720 | ↔ | Load on/off toggle press + selected fb |
| n | 701–720 | ↔ | Load level (0–65535) |
| b | 721–740 | → | Raise (hold — true while pressed) |
| b | 741–760 | → | Lower (hold — true while pressed) |
| b | 821–840 | → | Slider touch pulse (panel emits while user drags) |
| s | 601–620 | ← | Load name |

### Room Drawer (32 rooms)

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| b | 651–682 | ↔ | Room select (panel pulses; SIMPL echoes selected fb) |
| b | 1541–1572 | ← | Room visible (show/hide drawer item) |
| b | 781–812 | ← | "Lights on" indicator on drawer row |
| s | 641–672 | ← | Room name |

### Scenes (12)

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| b | 761–772 | ↔ | Scene press + selected fb |
| s | 621–632 | ← | Scene name |

### Header

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| s | 600 | ← | Current-room name (panel appends " Lighting") |

---

## Shades Page

### Shade Cards (10 shades)

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| s | 841–850 | ← | Shade name |
| b | 841–850 | ← | Moving indicator (animates card when true) |
| n | 841–850 | ← | Position 0–65535 (0 = closed) |
| b | 851–860 | → | Open (pulse) |
| b | 861–870 | → | Close (pulse) |
| b | 881–890 | → | Raise (hold) |
| b | 891–900 | → | Lower (hold) |

### Room Drawer (31 rooms)

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| b | 1101–1131 | ↔ | Room select + selected fb |
| b | 1581–1611 | ← | Room visible |
| b | 1132–1162 | ← | "Shades active" indicator |
| s | 1101–1131 | ← | Room name |

### Scenes (12)

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| b | 1163–1174 | ↔ | Scene press + selected fb |
| s | 852–863 | ← | Scene name |

### Header

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| s | 851 | ← | Current-room name (panel appends " Shades") |

---

## Climate Page

### Thermostat Analogs (×10 °F — e.g. `725` = 72.5 °F)

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| n | 961 | ← | Current temperature |
| n | 962 | ← | Heat setpoint (Heat mode + Dual-Auto) |
| n | 963 | ← | Cool setpoint (Cool mode + Dual-Auto) |
| n | 964 | ← | Setpoint minimum — scales the arc ring |
| n | 965 | ← | Setpoint maximum — scales the arc ring |
| n | 966 | ← | Single-Auto setpoint value (used when "show single" is active) |

### Mode / Fan / Schedule (press + feedback on the same join)

Each button pulses the join on press, then latches to "active" state when SIMPL drives the same join high. Wire these with a Toggle symbol or SIMPL+ logic bus that echoes the press back as feedback.

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| b | 961 | ↔ | Mode: Heat |
| b | 962 | ↔ | Mode: Cool |
| b | 963 | ↔ | Mode: Auto |
| b | 964 | ↔ | Mode: Off |
| b | 965 | ↔ | Fan: Auto |
| b | 966 | ↔ | Fan: On |
| b | 967 | ↔ | Schedule: Run |
| b | 968 | ↔ | Schedule: Hold |
| b | 969 | ↔ | Schedule: Away |

### Setpoint ± (pulse, panel → SIMPL)

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| b | 971 | → | Heat + |
| b | 972 | → | Heat − |
| b | 973 | → | Cool + |
| b | 974 | → | Cool − |
| b | 977 | → | Single-Auto + |
| b | 978 | → | Single-Auto − |

### Visibility (SIMPL → panel)

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| b | 970 | ← | Show/hide the **Auto** mode button (drive high when Auto is supported) |
| b | 975 | ← | Show the **single** setpoint row (drive high for Single-Auto mode or Heat/Cool-only modes where only one SP is relevant — panel uses `n966`) |
| b | 976 | ← | Show the **dual** setpoint rows (Heat + Cool; drive high for Dual-Auto mode — panel uses `n962` and `n963`) |

If neither `d975` nor `d976` is high, the setpoint card is hidden (e.g. Off mode).

### Room Drawer (30 rooms)

| Type | Range | Dir | Purpose |
|------|-------|-----|---------|
| b | 901–930 | ↔ | Room/thermostat select + selected fb |
| b | 1641–1670 | ← | Room visible |
| b | 931–960 | ← | "Climate active" indicator |
| s | 901–930 | ← | Room name |

### Header / Dial Labels

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| s | 961 | ← | Current-room name (panel appends " Climate") |
| s | 962 | ← | Thermostat name shown in dial center |

### Freed in this revision

`d979`–`d983` are no longer used — they were the separate mode/fan/sched press joins before press+fb were unified onto `d961`–`d969`.

---

## Music Page

32 rooms on one page. Per-room join blocks use a regular stride.

### Per-Room Pattern — Room N (1-indexed)

```
digital base = 400 + (N-1)*10 + 1      (Room 1 = 401, Room 2 = 411, … Room 32 = 711)
analog       = 400 + N                  (Room 1 = 401, …               Room 32 = 432)
serial base  = 400 + (N-1)*6 + 1        (Room 1 = 401, Room 2 = 407, … Room 32 = 587)
```

| Offset from digital base | Type | Dir | Purpose |
|--------------------------|------|-----|---------|
| +0…+4 | b | ↔ | Source 1–5 press + selected fb |
| +5 | b | → | Volume up (hold) |
| +6 | b | → | Volume down (hold) |
| +7 | b | → | Slider touch pulse (emits while user drags) |
| +8 | — | — | unused |
| +9 | b | → | Room Off (pulse) |

| Analog | Type | Dir | Purpose |
|--------|------|-----|---------|
| base | n | ↔ | Volume level 0–65535 |

| Offset from serial base | Type | Dir | Purpose |
|-------------------------|------|-----|---------|
| +0 | s | ← | Room name |
| +1…+5 | s | ← | Source 1–5 name |

### Worked Examples

Room 1 (Kitchen):
- Source 1–5 press: `d401–d405` · slider touch: `d408` · off: `d410` · vol up/down: `d406/d407`
- Volume analog: `n401`
- Room name: `s401` · Source 1–5 names: `s402–s406`

Room 32:
- Source 1–5 press: `d711–d715` · slider touch: `d718` · off: `d720` · vol up/down: `d716/d717`
- Volume analog: `n432`
- Room name: `s587` · Source 1–5 names: `s588–s592`

### Music — Global

| Type | # | Dir | Purpose |
|------|----|-----|---------|
| b | 301 | → | Media player panel toggle |
| b | 400 | → | Master All-Off (pulse) |
| s | 400 | ← | Current-room/zone name for header title |

---

## Notes for the SIMPL Programmer

- **Pulse** presses are single-clock high then low. Any "selected fb" on the same join is SIMPL's latch after processing the command.
- **Hold** presses stay high while the user is pressing and go low on release (pointer-up / pointer-leave). Wire these to your ramp / analog-step logic.
- **Slider analogs** are bidirectional. Panel sends user drags; SIMPL should send back the current hardware state so the slider tracks external changes. Panel also pulses the `+7` slider-touch join while the user is dragging — use this to gate feedback so the slider doesn't fight the user.
- **Room drawers** are crosspoint switches. The panel pulses a select join; SIMPL routes that room's state onto the page's shared joins (e.g. load levels, shade positions, thermostat values). This is why the number of "load cards" / "shade cards" / "mode buttons" on the panel is fixed — SIMPL decides what each one controls.
- **Show/visible** joins hide drawer rows SIMPL doesn't want exposed in the current project. If every row should be visible, just tie them high.
