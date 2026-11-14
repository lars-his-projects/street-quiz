/** Turn an Overpass API answer into the streets of the quiz (same rules as `scripts/fetch_area.py`). */

const NO_PUBLIC = new Set(["private", "no"]); // values of `access`: the public cannot use the way
const NOT_A_STREET = new Set(["platform", "corridor", "elevator", "construction", "proposed"]); // values of `highway`
const BRIDGE_SHARE = 0.5; // a name with a larger part of its length on bridges is the name of a bridge
const MIN_LENGTH = 15; // meters: a shorter street is a dot on the map
const EARTH_RADIUS = 6371008.8; // meters

type Line = [number, number][];

export interface OverpassElement {
  type: string;
  tags?: Record<string, string | undefined>;
  geometry?: { lat: number; lon: number }[];
}

export interface StreetCollection {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { name: string; length: number; highway: string; lanes: number };
    geometry: { type: "MultiLineString"; coordinates: Line[] };
  }[];
}

/** Return the length in meters of a line of [lon, lat] points. */
function lineLength(line: Line): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < line.length; i++) {
    const [lon1, lat1] = line[i - 1];
    const [lon2, lat2] = line[i];
    const east = rad(lon2 - lon1) * Math.cos(rad((lat1 + lat2) / 2));
    total += EARTH_RADIUS * Math.hypot(east, rad(lat2 - lat1));
  }
  return total;
}

/** Return the value of a `lanes` tag, or null when it is missing or not a whole number. */
function lanesValue(text: string | undefined): number | null {
  return text !== undefined && /^\s*\d{1,3}\s*$/.test(text) ? Number.parseInt(text, 10) : null;
}

/** Return the `highway` class with the largest length (the first in the alphabet when equal). */
function mainClass(lengths: Map<string, number>): string {
  return [...lengths.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))[0][0];
}

function isStreetWay(element: OverpassElement): boolean {
  const tags = element.tags ?? {};
  return (
    element.type === "way" &&
    (tags.name ?? "").trim() !== "" &&
    (element.geometry?.length ?? 0) >= 2 &&
    !NOT_A_STREET.has(tags.highway ?? "") &&
    !NO_PUBLIC.has(tags.access ?? "")
  );
}

/** Make a GeoJSON FeatureCollection from an Overpass JSON answer (`out geom`). */
export function overpassToStreets(answer: { elements?: OverpassElement[] }): StreetCollection {
  const linesByName = new Map<string, Line[]>();
  const lengthByName = new Map<string, number>();
  const bridgeByName = new Map<string, number>();
  const classesByName = new Map<string, Map<string, number>>();
  const lanesByName = new Map<string, number>();
  for (const element of answer.elements ?? []) {
    if (!isStreetWay(element)) continue;
    const tags = element.tags as Record<string, string | undefined>;
    const name = (tags.name ?? "").trim();
    const line: Line = (element.geometry ?? []).map((p) => [p.lon, p.lat]);
    const length = lineLength(line);
    linesByName.set(name, [...(linesByName.get(name) ?? []), line]);
    lengthByName.set(name, (lengthByName.get(name) ?? 0) + length);
    const classes = classesByName.get(name) ?? new Map<string, number>();
    const highway = tags.highway ?? "";
    classes.set(highway, (classes.get(highway) ?? 0) + length);
    classesByName.set(name, classes);
    const lanes = lanesValue(tags.lanes);
    if (lanes !== null) lanesByName.set(name, Math.max(lanesByName.get(name) ?? lanes, lanes));
    if ((tags.bridge ?? "no") !== "no") bridgeByName.set(name, (bridgeByName.get(name) ?? 0) + length);
  }
  const features = [...linesByName.keys()]
    .sort()
    .filter((name) => {
      const length = lengthByName.get(name) ?? 0;
      return length >= MIN_LENGTH && (bridgeByName.get(name) ?? 0) <= BRIDGE_SHARE * length;
    })
    .map((name) => ({
      type: "Feature" as const,
      properties: {
        name,
        length: Math.floor((lengthByName.get(name) ?? 0) + 0.5),
        highway: mainClass(classesByName.get(name) as Map<string, number>),
        lanes: lanesByName.get(name) ?? 1,
      },
      geometry: { type: "MultiLineString" as const, coordinates: linesByName.get(name) as Line[] },
    }));
  return { type: "FeatureCollection", features };
}
