import { type LngLatBoundsLike, Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { hideLabels } from "./labels";

// MapLibre looks for its worker file next to its own module. A bundle has no such file, and the map then draws no
// tile and no street: give it the address of the worker file in the build (`tests/build_worker.test.ts`).
setWorkerUrl(workerUrl);

/** A free vector style that needs no key (P3). */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** The padding and the maximum zoom of each fit of the map to a street. */
export const FIT_OPTIONS = { padding: 80, maxZoom: 17 };

/** Make a full-screen map with no labels in the container. It starts at `bounds`: no tile of another place loads. */
export function createMap(container: HTMLElement, bounds: LngLatBoundsLike): MapLibreMap {
  const map = new MapLibreMap({
    container,
    bounds,
    fitBoundsOptions: FIT_OPTIONS,
    attributionControl: { compact: true },
  });
  map.setStyle(STYLE_URL, { transformStyle: (_previous, next) => hideLabels(next) });
  return map;
}

/** The data of the marked street. */
export function streetData(lines: [number, number][][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "MultiLineString" as const, coordinates: lines },
  };
}

/** Add the layer of the marked street in the color of the theme (`--color-street`). */
export function addStreetLayer(map: MapLibreMap, lines: [number, number][][], color: string): void {
  map.addSource("street", { type: "geojson", data: streetData(lines) });
  map.addLayer({
    id: "street",
    type: "line",
    source: "street",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": color, "line-width": 9, "line-opacity": 0.9 },
  });
}

/** The data of the other option streets (#58): each feature has `other` (1, 2 or 3) for its color. */
export function otherData(streets: { lines: [number, number][][] }[]) {
  return {
    type: "FeatureCollection" as const,
    features: streets.map((street, i) => ({
      type: "Feature" as const,
      properties: { other: i + 1 },
      geometry: { type: "MultiLineString" as const, coordinates: street.lines },
    })),
  };
}

/** Add the layer of the other option streets below the marked street. `colors` are the colors of `other` 1, 2 and 3. */
export function addOtherLayer(map: MapLibreMap, colors: [string, string, string]): void {
  map.addSource("others", { type: "geojson", data: otherData([]) });
  map.addLayer(
    {
      id: "others",
      type: "line",
      source: "others",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["match", ["get", "other"], 1, colors[0], 2, colors[1], colors[2]],
        "line-width": 6,
        "line-opacity": 0.9,
      },
    },
    "street",
  );
}
