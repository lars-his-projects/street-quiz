import { describe, expect, it } from "vitest";
import { normalizeStreetName } from "../src/normalize";
import { choices } from "../src/quiz";

const street = (name: string) => ({ name, lines: [] });
const many = ["Anna", "Berta", "Cora", "Dora", "Emma", "Frieda"].map(street);

/** A fixed random: gives the values in a loop. */
const fixed = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("choices", () => {
  it("gives 4 different names, and one is the name of the street", () => {
    const result = choices(many, many[2], fixed([0.1, 0.5, 0.9]));
    expect(result).toHaveLength(4);
    expect(new Set(result.map(normalizeStreetName)).size).toBe(4);
    expect(result).toContain("Cora");
  });

  it("puts the correct name at a random position", () => {
    const positions = new Set<number>();
    for (const v of [0, 0.3, 0.6, 0.99]) {
      positions.add(choices(many, many[0], fixed([v])).indexOf("Anna"));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it("counts names that are the same after normalize as one name", () => {
    const streets = ["Straße", "STRASSE", "Strasse", "Bahn", "Ring"].map(street);
    const result = choices(streets, streets[0], fixed([0.2]));
    expect(result).toHaveLength(3);
    expect(new Set(result.map(normalizeStreetName)).size).toBe(3);
  });

  it("gives all names when the area has fewer than 4 names", () => {
    const result = choices(many.slice(0, 3), many[1], fixed([0.4]));
    expect([...result].sort()).toEqual(["Anna", "Berta", "Cora"]);
  });
});
