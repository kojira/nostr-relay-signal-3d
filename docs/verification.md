# Verification

## Local results
- Production build passed. Output JavaScript is about 532 kB uncompressed / 135 kB gzip; Vite reports its standard 500 kB chunk warning. CSS is about 5 kB. No external runtime assets.
- Headless Chrome via Playwright, software WebGL (SwiftShader): actual WebGL rendering, 9,808 rendered triangles, ExtrudeGeometry depth 0.5, one lightning-shaped through-hole. Desktop screenshot was visually inspected for side thickness and logo fidelity.
- Automatic rotation, pause/resume, mouse drag, reset, keyboard, source SVG HTTP 200, initial and dynamic reduced-motion, 390px viewport overflow check, emulated touch drag, WebGL-unavailable fallback all passed. No console errors or page errors on WebGL-enabled pages. Software-renderer ReadPixels performance warnings were observed; they are not claimed absent.
- Negative control: temporarily set the automatic rotation increment to zero, rebuilt, and ran the rotation assertion. It failed with “Automatic rotation must advance”. Restored the original implementation and rebuilt before deployment.
- Supply-chain control: `pnpm config get minimumReleaseAge` returned 10080. A registry-observed same-day Vite 8.3.5 release was rejected in an isolated lockfile-only probe; setting the age to zero in that probe admitted the same version. Production dependency audit reported no known vulnerabilities at test time. This is not a security guarantee.

## Limits
No physical phone, Safari, Firefox, screen reader, or hardware-GPU performance test was performed. Touch and mobile results are Chromium emulation, not device testing. The forced WebGL-unavailable test intentionally causes Three.js context-creation errors; that separate page is not counted as an error-free WebGL run. No full accessibility audit is claimed.

## Deployment
GitHub Pages reported `built`; https://kojira.github.io/nostr-relay-signal-3d/ returned HTTP 200. The same complete browser checks passed against that public URL, including WebGL rendering, mouse/touch interaction and SVG download. WebGL-enabled runs had zero console errors and zero page errors; SwiftShader performance warnings remain as noted above. See `artifacts/deployed-test-results.json`, `artifacts/deployed-desktop.png`, and `artifacts/deployed-mobile.png`.
