import { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { hideLabels } from "./labels";

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
