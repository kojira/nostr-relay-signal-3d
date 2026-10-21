# Nostr — Relay Signal in 3D

An independent logo experiment: a violet N with a lightning-shaped through-cut, physically extruded and bevelled in Three.js. The three relay nodes and orbit are real 3D geometry too. This is not an official Nostr identity.

Drag or swipe to orbit, scroll to zoom, pause/resume automatic rotation, or reset the view. With the canvas focused, use arrow keys to rotate and +/− to zoom. Reduced-motion preferences start the scene paused and are tracked when changed. The original SVG is downloadable; browsers without WebGL receive an SVG fallback.

## Develop and verify

Use Node 22.12+ and pnpm 10.16+. The workspace enforces a seven-day minimum package release age with no exclusions. Dependencies are pinned and locked; no CDN assets or external fonts are used.

```
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
pnpm build
pnpm exec playwright install chromium
pnpm test
```

`pnpm test` serves the production build on loopback port 18743. Set `BROWSER_CHANNEL=chrome` to test with an installed Chrome. `BASE_URL` points the same tests at a deployed page. Test telemetry is available only with `?test=1` and contains geometry and camera state, not user data. See [design](docs/design.md) and [verification](docs/verification.md).

## Publish

Publish the contents of `dist/` (not the source directory) to the `gh-pages` branch, with an empty `.nojekyll` file. GitHub Pages must use that branch's root. No service, credentials or runtime configuration are needed by the page. Keep source on `main`, and never publish `node_modules` or local logs.

## Credits

Based on the supplied Relay Signal SVG logo concept, included in `public/nostr-relay-signal.svg`. Rendering: Three.js (MIT). The original source SVG is kept unchanged. No ownership or trademark affiliation with the Nostr protocol is implied.
