# Learnings

The agent writes here what it learned the hard way. Each line must save time in a later session.

## Environment and libraries

- A Playwright script in a cloud session loads the real map with a plain `chromium.launch()`: the browser uses the proxy of the session. The requests with `net::ERR_ABORTED` are tiles that MapLibre stopped when the map moved: they are not a fault.
- `overpass-api.de` resets each connection from a cloud session. `scripts/fetch_area.py` then asks the next server of `OVERPASS_URLS`: run the script, do not test hosts by hand (#8).
- `overpass.openstreetmap.fr` answers 403 "only available to white-listed usages" (no CORS header): do not use it. From a cloud session, no public Overpass server answered an area query on 2026-11-14 (resets, 504, timeouts): a live start of a new area cannot be checked there (#35, #52).
- MapLibre GL JS 6 loads its worker from a file next to its own module. A Vite bundle has no such file: the map draws no tile and no street, and the console says "Worker failed to load". `src/map.ts` gives the address with `setWorkerUrl()` and a `?url` import (live fault, 2026-11-14).

## Code

- The CSS of MapLibre comes after `src/style.css` in the bundle: a rule of the same weight for a `.maplibregl-*` class loses. Do not move a map control with CSS. Keep the map and the other parts of the page apart in the layout (the attribution was on the answer field, 2026-11-14).
- A Playwright script must not set `Math.random` for the whole page: MapLibre uses it for its tiles, and the map stays empty. The tiles of the real map come slowly in a cloud session: wait for `networkidle`, not for a fixed 5 s (#17).
- A page check that blocks the outside requests does not show that the map works. Do level 4 of the `verify` skill with the real map, and read the console errors.
- A fixed `Math.random` (`addInitScript`) stops MapLibre GL JS: the map never gets idle. The browser test reads the marked street from `data-street` of `#app` (#14).
- MapLibre hides the attribution when no visible layer uses a source with an `attribution`: a stored test style needs one such layer (#14).
- The style of the map can load before `fetch()` of the area ends: add the street layer with `map.isStyleLoaded()` or `once("load")`, not only `on("load")` (#15).
