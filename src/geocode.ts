/** Find the areas that have a typed name (Nominatim). */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** An area of the search result. */
export interface AreaResult {
  name: string;
  label: string;
  relation: number;
}

interface NominatimItem {
  osm_type?: string;
  osm_id?: number;
  name?: string;
  display_name?: string;
  category?: string;
  type?: string;
}

/** Build the search URL for a typed name. Send it only on submit (usage policy: no search while typing). */
export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({ format: "jsonv2", q: query.trim() });
  return `${NOMINATIM_URL}?${params.toString()}`;
}

/** Keep only the relations of an area. The list keeps the order of Nominatim. */
export function parseSearchResponse(response: unknown): AreaResult[] {
  if (!Array.isArray(response)) return [];
  const areas: AreaResult[] = [];
  for (const item of response as NominatimItem[]) {
    if (item.osm_type !== "relation" || typeof item.osm_id !== "number") continue;
    const label = item.display_name ?? "";
    areas.push({ name: item.name || label.split(",")[0].trim(), label, relation: item.osm_id });
  }
  return areas;
}

/** Ask Nominatim once for a typed name. */
export async function findAreas(query: string): Promise<AreaResult[]> {
  const response = await fetch(buildSearchUrl(query));
  if (!response.ok) throw new Error(`Nominatim answered ${response.status}`);
  return parseSearchResponse(await response.json());
}
