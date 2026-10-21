# Relay Signal — real 3D logo

## Scope and evidence
The approved source is the supplied `nostr-relay-signal.svg`: violet N polygon, dark lightning-shaped inset, three relay nodes, elliptical orbit, rounded dark frame. Reuse its exact N and lightning polygon coordinates as extruded geometry (not an image on a rotating plane). Use bevelled sides, lighting, depth and an initially oblique view so thickness is visible. The orbit is a tube and nodes are spheres; the frame is optional context, not the logo geometry.

Build one small responsive, static WebGL page with Three.js and Vite, no runtime service or external CDN/font. Use an independent git repository. Publish only this project's static output from a dedicated `gh-pages` branch to GitHub Pages. Public URL is Unknown until deployment and HTTP/browser verification.

## Interaction and accessibility
Automatic rotation, pointer/touch orbit, accessible pause/resume and reset buttons, SVG download. Touch gestures operate within the canvas. Honor prefers-reduced-motion initially and on changes; use an explicit toggle to resume. Render on demand while paused/reduced-motion. Include a descriptive accessible canvas label and a WebGL-unavailable fallback. Responsive desktop/mobile layout; visible keyboard focus.

## Supply chain
pnpm with `minimumReleaseAge: 10080`, pinned direct dependencies and committed lockfile. No package-name exclusions, CDN vendoring, custom release-age checker or lifecycle build scripts. Production depends only on bundled Three.js. Playwright is development-only for real browser verification. Validate the release-age setting and rejection behavior separately from the production lockfile.

## Non-goals
No wallet, Nostr connection, keys, backend, analytics, user data collection, external textures, new branding claim or official Nostr affiliation. Do not publish environment settings, private paths, credentials or parent repository content. No physics/AR or broad device compatibility claims.

## Acceptance
1. Browser shows an actual extruded N with bevels, lighting and visible side faces at oblique angles; source SVG is downloadable.
2. Automatic rotation advances; drag/touch rotates; pause stops automatic rotation; reset works; reduced-motion starts paused; mobile layout fits viewport.
3. Build succeeds. Chromium browser tests record rendering, controls, console errors/page errors, screenshots and WebGL geometry evidence. A negative control must demonstrate the rotation regression assertion fails when automatic rotation is removed. Record tested and untested environments honestly.
4. Independent public repo contains only this page, design, source SVG, lockfile, test and deployment files. Pages URL returns HTTP 200 and the deployed page passes browser smoke/interaction checks. Never report an unverified inferred URL as deployed.
