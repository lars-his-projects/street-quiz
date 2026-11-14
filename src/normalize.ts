/** Normalize a street name for a comparison: lower case, no accents, ß as ss, no extra spaces. */
export function normalizeStreetName(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/ß/g, "ss").replace(/\s+/g, " ").trim();
}
