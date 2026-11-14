import { describe, expect, it } from "vitest";
import { overpassToStreets } from "../src/overpass";
import expected from "./fixtures/overpass_sample.expected.json";
import answer from "./fixtures/overpass_sample.json";

const names = overpassToStreets(answer).features.map((f) => f.properties.name);

describe("overpassToStreets", () => {
  it("skips a private way", () => expect(names).not.toContain("Privaatweg"));
  it("skips a platform", () => expect(names).not.toContain("Perron"));
  it("skips the name of a bridge", () => expect(names).not.toContain("Brugstraat"));
  it("skips a dot", () => expect(names).not.toContain("Stip"));
  it("keeps a street with a short bridge part", () => expect(names).toContain("Mixstraat"));
  it("joins two parts of one name in one feature", () => {
    const found = overpassToStreets(answer).features.filter((f) => f.properties.name === "Goedestraat");
    expect(found).toHaveLength(1);
    expect(found[0].geometry.coordinates).toHaveLength(2);
  });
  it("gives the same collection as scripts/fetch_area.py", () => {
    expect(overpassToStreets(answer)).toEqual(expected);
  });
});
