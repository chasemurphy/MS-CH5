# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm start                    # Dev server with BrowserSync on port 3000
npm run build:prod           # Production webpack build to dist/msch5/
npm run build:archive        # Create .ch5z via ch5-cli (requires build:prod first)
npm run build:prod && npm run build:archive  # Full build + archive
```

**CRITICAL:** Always use `ch5-cli archive` to create .ch5z files. Never use custom zip scripts — the Crestron runtime requires the specific archive format that ch5-cli produces.

**Node path:** Node is at `/usr/local/bin/node`. Prefix commands with `export PATH="/usr/local/bin:$PATH"` if npm/npx isn't found.

## Architecture

This is a Crestron CH5 HTML5 touchpanel project targeting TSW-1080 (1920x1200) and Crestron One iPhone app. It deploys as a `.ch5z` archive loaded to a Crestron processor.

### CH5 Components First

All interactive UI uses native `<ch5-button>` web components with declarative attributes — not custom JavaScript:

- `sendEventOnClick="1"` — pulse digital join 1 on press
- `receiveStateSelected="1"` — feedback state from SIMPL on join 1
- `receiveStateShow="11"` — show/hide controlled by SIMPL on join 11
- `noshowtype="remove"` — detach from DOM when hidden (grid reflows)

Only write custom JS when no CH5 attribute exists for the needed behavior.

### CrComLib

- Uses `@crestron/ch5-crcomlib` v2.17.3 (UMD bundle)
- CH5 web components (`<ch5-button>`, etc.) are defined inside CrComLib — no separate import needed
- `app/services/joins.js` provides a dev shim when CrComLib isn't present (browser testing)
- Connection to processor is configured on the panel/app itself, never hardcoded in HTML/JS

### Build Pipeline

1. Webpack 4 concatenates (not bundles) JS files via `webpack-concat-plugin`:
   - `cr-com-lib.js` — CrComLib UMD bundle
   - `component.js` — `services/*.js` + `components/**/*.js` (order matters: services first)
2. CSS extracted to `assets/css/main.css` (custom) and `external.css` (FontAwesome)
3. `ch5-cli archive -p msch5 -d dist/msch5 -o dist` creates the `.ch5z`

### Styling

- Single CSS file: `app/assets/theme/custom.css` with CSS custom properties
- Color palette: cream/charcoal/gold theme
- Responsive breakpoint at 900px (phone 2-col grid → TSW-1080 3-col grid)
- CH5 button internals styled via `.ch5-button--default`, `.cb-btn`, `.ch5-button--icon`, `.ch5-button--label`
- States: `.ch5-button--pressed` (finger down), `.ch5-button--selected` (SIMPL feedback)

### Join System

Panel uses fixed digital joins. SIMPL handles room switching via crosspoint matrix — panel code never changes when adding rooms.

Home page joins:
- d[1]-d[6]: tile press + feedback (Lighting, Climate, Shades, AV, Music, Security)
- d[11]-d[16]: tile show/hide (controlled by SIMPL)
- d[200]: Home nav button press + feedback

## Key Patterns

- All page HTML is inline in `app/index.html` (no dynamic loading)
- `app/noop.js` exists only because webpack requires an entry point
- `scripts/archive.js` exists but is NOT used — `ch5-cli archive` is the correct tool
- CH5 components only render in the Crestron runtime — browser preview shows unstyled elements
- `uglify: false` in ConcatPlugin because uglify-es crashes on CrComLib's modern JS
