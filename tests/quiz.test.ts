import { describe, expect, it } from "vitest";
import { bounds, check, nextStreet, streetsFromGeoJson } from "../src/quiz";
import areaText from "./data/area_small.geojson?raw";

const streets = streetsFromGeoJson(JSON.parse(areaText));

describe("quiz", () => {
  it("reads the streets of the stored area", () => {
    expect(streets.map((s) => s.name)).toEqual(["Auguststraße", "Linienstraße", "Tucholskystraße"]);
  });

  it("check() ignores capital letters, accents and spaces", () => {
    const street = { name: "Rue de l'Élysée", lines: [] };
    expect(check("  rue de l'elysee ", street)).toBe(true);
    expect(check("RUE DE L'ÉLYSÉE", street)).toBe(true);
    expect(check("rue de la paix", street)).toBe(false);
  });

  it("nextStreet() never gives the same street two times in sequence", () => {
    let last = nextStreet(streets);
    for (let i = 0; i < 200; i++) {
      const next = nextStreet(streets, last);
      expect(next).not.toBe(last);
      last = next;
    }
  });

  it("nextStreet() gives the only street of a one-street area", () => {
    expect(nextStreet(streets.slice(0, 1), streets[0])).toBe(streets[0]);
  });

  it("bounds() covers all parts of the street", () => {
    expect(bounds(streets[0])).toEqual([13.3955, 52.5265, 13.4005, 52.5275]);
  });
});
