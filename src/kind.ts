import { normalizeStreetName } from "./normalize";

/** The kind of a street name (#57): the options of a question have the same kind when possible. */
export type Kind = "street" | "square" | "water" | "park" | "other";

/** The word ends of each kind (Dutch, German, English, French). The first kind with a match wins. */
const ENDS: [Kind, string[]][] = [
  ["square", ["plein", "platz", "square", "markt", "market", "place", "plaza", "court", "hof", "hofje", "circus"]],
  ["water", ["gracht", "kade", "kai", "quay", "canal", "ufer", "wal", "singel", "kanaal"]],
  ["park", ["plantsoen", "park", "garden", "gardens", "garten"]],
  [
    "street",
    [
      "straat",
      "strasse",
      "street",
      "road",
      "weg",
      "laan",
      "lane",
      "avenue",
      "allee",
      "gang",
      "steeg",
      "pad",
      "way",
      "drive",
      "gasse",
      "poort",
      "rue",
      "dijk",
    ],
  ],
];

/** Return the kind of a name: the last word (of space and hyphen parts) with a known end decides. */
export function streetKind(name: string): Kind {
  const words = normalizeStreetName(name)
    .split(/[\s-]+/)
    .reverse();
  for (const word of words) {
    for (const [kind, ends] of ENDS) {
      if (ends.some((end) => word.endsWith(end))) return kind;
    }
  }
  return "other";
}
