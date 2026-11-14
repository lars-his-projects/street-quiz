# Learnings

The agent writes here what it learned the hard way. Each line must save time in a later session.

## Environment and libraries

- A Playwright script in a cloud session loads the real map with a plain `chromium.launch()`: the browser uses the proxy of the session. The requests with `net::ERR_ABORTED` are tiles that MapLibre stopped when the map moved: they are not a fault.
- `overpass-api.de` resets each connection from a cloud session. `scripts/fetch_area.py` then asks the next server of `OVERPASS_URLS`: run the script, do not test hosts by hand (#8).
- MapLibre GL JS 6 loads its worker from a file next to its own module. A Vite bundle has no such file: the map draws no tile and no street, and the console says "Worker failed to load". `src/map.ts` gives the address with `setWorkerUrl()` and a `?url` import (live fault, 2026-11-14).

## Code

- The CSS of MapLibre comes after `src/style.css` in the bundle: a rule of the same weight for a `.maplibregl-*` class loses. Do not move a map control with CSS. Keep the map and the other parts of the page apart in the layout (the attribution was on the answer field, 2026-11-14).
- A page check that blocks the outside requests does not show that the map works. Do level 4 of the `verify` skill with the real map, and read the console errors.
