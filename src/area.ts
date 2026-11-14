/** Get the streets of an area: from the store on the device, else from Overpass (`scripts/fetch_area.py`). */
import { overpassToStreets, type StreetCollection } from "./overpass";
import { loadArea, saveArea } from "./store";

/** The same servers and the same query as `scripts/fetch_area.py`. */
export const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
const AREA_OFFSET = 3600000000; // Overpass area id = relation id + this offset

/** Return the Overpass QL query for the named ways in the area of a relation. */
export function overpassQuery(relation: number): string {
  return `[out:json][timeout:120];area(id:${AREA_OFFSET + relation})->.a;way(area.a)["highway"]["name"];out geom;`;
}

/** Ask each Overpass server one time. Throw when no server gives an answer. */
async function askOverpass(relation: number): Promise<unknown> {
  const body = new URLSearchParams({ data: overpassQuery(relation) });
  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, { method: "POST", body });
      if (response.ok) return await response.json();
    } catch {
      // Try the next server.
    }
  }
  throw new Error("no Overpass server gave an answer");
}

/** Load the streets of an area. A new area goes into the store, so a second start sends no request. */
export async function streetsOfArea(relation: number): Promise<StreetCollection> {
  const stored = (await loadArea(relation)) as StreetCollection | undefined;
  if (stored?.features?.length) return stored;
  const streets = overpassToStreets((await askOverpass(relation)) as Parameters<typeof overpassToStreets>[0]);
  if (streets.features.length > 0) await saveArea(relation, streets);
  return streets;
}
