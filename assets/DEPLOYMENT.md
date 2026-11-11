# GitHub Pages preparation

Nothing has been pushed or deployed. The expected URL, after approval and publication, is:

https://annasehgal.github.io/the-mappers/

This is a static site. Three.js and OrbitControls are local files; Web Speech uses the browser. There is no backend, paid API or subscription. For free Pages hosting, make the repository public. GitHub documents Pages availability and custom workflows at:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Build locally

Requirements: Node 22 and Python 3.12 with the existing build-only qrcode dependency.

```sh
cd assets
python3 -m pip install -r requirements-build.txt
node verify.mjs
node tests/entry-c.mjs
node scripts/build-pages.mjs --base-url https://annasehgal.github.io/the-mappers/
```

Output is assets/dist. The packager refuses to overwrite a nonempty directory. To build again, supply a fresh --out-dir instead of deleting existing files.

The packager copies the runtime source without rewriting JavaScript, HTML, CSS or image paths. Relative imports and the import map retain the repository prefix automatically. It generates all four SVG QR codes for the supplied base URL, not the local-network address. A pages-manifest.json records the production URLs and packaged file hashes.

The only transformed page is the packaged QR handout's explanatory text. The source QR assets, checkpoint identifiers, registry, URL parser, and application event handlers are unchanged.

## Publish only after authorization

The repository currently has no commits. No commit, staging or push was performed by this task.

After you approve publication:

1. Review and commit the application under assets/ and .github/workflows/pages.yml, then push the approved commit to main. Include vendor/ and its license. Do not publish a generated local QR handout as the production package.
2. In repository Settings → Pages, choose GitHub Actions as the source.
3. In Actions, select **Holt Hall Pages (manual)** and choose **Run workflow**.
4. Leave **publish** unchecked for a build-only run. This uploads an artifact but does not deploy.
5. When ready to publish the reviewed build, run the workflow with **publish** checked. The github-pages environment can also be configured with required reviewers.

The workflow has no push or pull_request deployment trigger. The build reads the actual Pages base URL from configure-pages, then generates the production QR assets. Deployment requires the separate manual publish input.

## QR checkpoint URLs

The deployed handout will be at /the-mappers/qr.html. Each QR uses the same application with a different location parameter:

- ?building=holt&floor=1&location=holt-entry-a
- ?building=holt&floor=1&location=holt-entry-b
- ?building=holt&floor=1&location=holt-entry-c
- ?building=holt&floor=1&location=holt-entry-d

Print the generated production handout after the live URL has been checked. Scanning establishes a starting position; progress remains manually confirmed.

## Checks completed locally

- Source and production package loaded in mobile Chrome under a /the-mappers/ prefix.
- 375×812, 390×844, 393×852, 430×932 layouts, including expanded options.
- All four QR identifiers, manual start selection, map-tap confirmation, search and categories.
- 2D/3D switching, zoom, touch rotation/pinch, checkpoints and recenter.
- Speech API invocation, replay/mute, pause/resume and arrival.
- Entry C to 102, 123, 173 and both bathroom wings, including doorway and short stairs.
- 1,369 route combinations among the 37 currently connected rooms.
- Static file hashes, local resource loading, production QR URLs and manual workflow gating.

This is local production-package verification, not a live GitHub Actions run or physical phone/speaker test.

## Remaining map-data limits

The catalog lists 79 rooms; 37 have corridor/door connections. All four entries can reach those 37. The other 42 remain unavailable and are listed in ROUTE_AUDIT.md. They were not changed under this task's strict boundaries.

Entry C's short stairs are a same-floor passage confirmed by the user. They are explicitly excluded from accessible routing. The 2011 raster supports positions and proportions, not physical distance calibration or current door access. Route lengths remain plan units.

## Local preview and cleanup

All project servers used for this task are stopped at completion. To preview again:

```sh
cd assets
python3 -m http.server 8002 --bind 127.0.0.1
```

Stop that server with Ctrl-C when finished. For the browser checks, install Playwright in a separate test environment and use an installed Chrome:

```sh
python tests/mobile.py --base-url http://127.0.0.1:8002/
```
