# Holt Hall mobile navigation

Current deployment and verification instructions are in [DEPLOYMENT.md](DEPLOYMENT.md). The exact change list is in [CHANGELOG.md](CHANGELOG.md). IMPLEMENTATION.md describes an earlier prototype.

For a local preview, serve this folder and open http://localhost:8002/. Production QR codes are generated for the GitHub Pages URL by the build script; source QR assets may still contain the earlier LAN demonstration address.

The current map is rendered from vector geometry in building.js. The source image is retained as an optional reference layer. QR entry, spoken instructions, manual checkpoint progress, and arrival are implemented. Node checks and the mobile browser journey passed; physical phone scanning and speaker output have not been field-tested.

Run: `python3 -m http.server 8002 --bind 127.0.0.1`. Stop with Ctrl-C.

Three.js 0.160.0 and OrbitControls are bundled locally in vendor/. The app needs a connection to its host, but no runtime CDN access.

Calibration uses the unchanged 1200 × 921 PNG and the shared transform (x-640, height, y-425). Room 102's threshold is (356,393); the entrance route totals 351 plan units. Physical distance and time require a measured raster calibration.

All four entries route to the 37 connected rooms in the 79-room catalog. Entry C now crosses its actual doorway before the user-confirmed same-floor short stairs. The remaining 42 rooms need door connections. Wall heights and staircase risers are presentation choices; small recesses and curved details are not fully reconstructed.

Tests: `node verify.mjs`, `node tests/entry-c.mjs`, and `python tests/mobile.py` (current Playwright and Chrome required for the browser checks). The old verify_mobile.py targets the earlier prototype; use tests/mobile.py for the current app.
