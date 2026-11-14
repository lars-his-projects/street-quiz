import { normalizeStreetName } from "./normalize";

/** One street of an area: a name and all its parts as lines of [lon, lat]. */
export interface Street {
  name: string;
  lines: [number, number][][];
}

interface StreetFeature {
  properties: { name: string };
  geometry: { type: string; coordinates: [number, number][][] };
}

/** Make the streets from the stored GeoJSON of an area (`scripts/fetch_area.py`). */
export function streetsFromGeoJson(collection: { features: StreetFeature[] }): Street[] {
  return collection.features
    .filter((f) => f.geometry.type === "MultiLineString" && f.properties.name)
    .map((f) => ({ name: f.properties.name, lines: f.geometry.coordinates }));
}

/** Pick a random street that is not the last one (when there are two or more). */
export function nextStreet(streets: Street[], last?: Street, random: () => number = Math.random): Street {
  if (streets.length === 0) throw new Error("no streets");
  const choices = streets.length > 1 ? streets.filter((s) => s !== last) : streets;
  return choices[Math.floor(random() * choices.length)];
}

/** Return true when the typed answer is the name of the street (no case, no accents). */
export function check(answer: string, street: Street): boolean {
  return normalizeStreetName(answer) === normalizeStreetName(street.name);
}

/** Return the [west, south, east, north] box of the street. */
export function bounds(street: Street): [number, number, number, number] {
  const points = street.lines.flat();
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}
