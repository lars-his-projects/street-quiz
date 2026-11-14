import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { hideLabels } from "./labels";

// MapLibre looks for its worker file next to its own module. A bundle has no such file, and the map then draws no
// tile and no street: give it the address of the worker file in the build (`tests/build_worker.test.ts`).
setWorkerUrl(workerUrl);

/** A free vector style that needs no key (P3). */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Make a full-screen map with no labels in the container. */
export function createMap(container: HTMLElement): MapLibreMap {
  const map = new MapLibreMap({
    container,
    center: [13.405, 52.52],
    zoom: 14,
    attributionControl: { compact: true },
  });
  map.setStyle(STYLE_URL, { transformStyle: (_previous, next) => hideLabels(next) });
  return map;
}
