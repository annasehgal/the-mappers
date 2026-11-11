# Holt Hall entrance-to-102 prototype

## Run and scan

Run `python3 -m http.server 8001 --bind 0.0.0.0` in this directory. Open `http://localhost:8001/qr.html` on the host and scan the QR from a phone on the same Wi-Fi. The current QR targets `http://10.0.0.68:8001/` and is for local demonstration, not permanent installation. Firewall or Wi-Fi client isolation can prevent phone access.

Regenerate after changing the host or deploying:

```sh
python3 generate_qr.py https://YOUR-HOST/path/
```

Update the human-readable host/link in qr.html to match. No camera permission or scanner SDK is needed: the phone's camera opens the URL. The registry in locations.js maps identifiers to graph nodes. Unknown buildings, floors and identifiers are rejected.

## Journey

1. Scan the entrance QR (or open its link).
2. Confirm the displayed entrance beside Room 125, or choose the Room 111 junction.
3. Search HOLT 102 and select the result.
4. Inspect the preview; toggle 3D, pan, zoom, or return to 2D.
5. Tap Start navigation. The visible instruction is also sent to Web Speech.
6. Walk to each named checkpoint, then tap Confirm next checkpoint. This is the only mechanism moving the navigation position.
7. Confirm arrival at the Room 102 doorway. The arrival message is spoken unless muted.
8. Tap Navigate to another room to reset.

Audio can be muted or replayed. Pending speech is cancelled before each new instruction, on reset, on room change, and when the page is hidden. Unsupported speech browsers retain visual instructions. Speech output depends on device voices and volume.

## Reconstruction

Source: unchanged map-holt-1st floor.png, 1200 × 921 pixels. Uniform mapping is (x - 640, elevation, y - 425), shared by floors, walls, labels, doors, stairs, routes and the optional source image.

building.js contains a manually traced floor outline, courtyard void, straight wall segments with door gaps, threshold strips and stair locations. The model renders independently of the source image in both modes. Source plan in the expanded sheet toggles the original raster for comparison. Wall height (9 units), wall thickness (1.7 units) and staircase risers are visualization choices; ceiling heights and riser counts are not documented in the source. Stair symbols indicate locations, not navigable routes to another floor. Curved lecture-room seating and furniture are deliberately omitted. The left core court is outlined by walls; it is not a navigation area.

Room 102's label center is (345,406); its traced rectangular interior is x330–367, y393–419. The route ends at the visible upper door gap, (356,393). Route: (170,532) → (254,532) → (254,380) → (356,380) → (356,393). This totals 351 source-plan units. The entrance is not identified as the “main entrance” in the drawing; physical signage must confirm that designation before installation.

The 2011 plan is not a survey of present conditions. Traces are manually interpreted at raster resolution, not architect-certified measurements. Wall traces do not model every small recess, door leaf or curved detail. A source comparison and on-site review remain necessary before navigation use.

## Distance and scope

There is no trustworthy raster-to-metres calibration. The printed sheet scale alone does not establish its scan DPI. The app reports plan units, not invented metres or walking times. In navigation.js, supplying a measured metresPerPixel enables metres and a clearly defined 1.2 m/s walking-time assumption.

Only Room 102 is routed; other listed rooms are searchable and marked routing unavailable. No other building/floor, outdoor routing, GPS or continuous tracking is implemented.

## Validation

Run `node verify.mjs` for A*, transform, QR validation, direction, distance, and wall-intersection assertions. These check the traced model, not untraced real-world obstructions.

Run `python3 verify_mobile.py` with a current Playwright and installed Chrome, with the server on port 8001. It checks QR URL entry, search, preview, 2D/3D, speech invocation/mute, checkpoints, arrival/reset and phone widths. It does not simulate a physical camera scan or verify audible speaker output on an actual phone.
