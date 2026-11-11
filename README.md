# Holt Hall Indoor Navigation

A mobile-first indoor navigation prototype for the first floor of Holt Hall at California State University, Chico. It uses the supplied architectural floor plan to create an interactive 2D and 3D map.

## Features

- Search first-floor rooms and points of interest.
- Choose a starting point manually or use a QR checkpoint for Entry A, B, C, or D.
- View routes and checkpoints in 2D or 3D, with zoom, pan, and camera controls.
- Follow visual and browser-spoken directions, confirm checkpoints, and see an arrival indicator.
- Use the same application on iPhone and Android browsers.

QR codes set an initial position. Navigation progress is manually confirmed; the app does not track a live indoor location.

## Run locally

From the repository root:

```sh
cd assets
python3 -m http.server 8002 --bind 127.0.0.1
```

Open `http://localhost:8002/` in a browser. Stop the server with Ctrl-C. Three.js and OrbitControls are included locally; no paid API or backend is required.

## GitHub Pages

The expected site address is [annasehgal.github.io/the-mappers](https://annasehgal.github.io/the-mappers/) once published. In repository **Settings → Pages**, select **GitHub Actions** as the source. Then open **Actions → Holt Hall Pages (manual)** and run the workflow: leave **publish** unchecked for a build-only check, or check it to publish.

The production build generates QR codes for the configured Pages URL. See [deployment instructions](assets/DEPLOYMENT.md) for build requirements, QR URLs, and the full workflow.

## Current limitations

- The catalog lists 79 rooms; 37 currently have route connections from all four entries. The remaining rooms need doorway or suite-access data.
- Entry C uses short stairs. Accessible routing is not yet available because route accessibility has not been established.
- The floor plan dates from 2011, and the model and routes need on-site validation before use as building guidance.
- Physical distance and walking time are not shown because the plan image has not been calibrated to a measured distance.

## Verification and project files

The source application, floor plan, bundled rendering library, tests, and documentation are in [`assets/`](assets/). The [route audit](assets/ROUTE_AUDIT.md) lists current coverage; the [change log](assets/CHANGELOG.md) describes the latest implementation work.

To run the graph checks:

```sh
cd assets
node verify.mjs
node tests/entry-c.mjs
```
