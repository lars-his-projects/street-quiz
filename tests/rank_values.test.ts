import { describe, expect, it } from "vitest";
import { overpassToStreets } from "../src/overpass";

function way(highway: string, lanes: string | undefined, east: number) {
  const tags: Record<string, string> = { name: "Teststraat", highway };
  if (lanes !== undefined) tags.lanes = lanes;
  return {
    type: "way",
    tags,
    geometry: [
      { lat: 0, lon: 0 },
      { lat: 0, lon: east },
    ],
  };
}

const props = (...elements: ReturnType<typeof way>[]) => overpassToStreets({ elements }).features[0].properties;

describe("rank values of a street", () => {
  it("gives the length in whole meters", () => expect(props(way("residential", undefined, 0.001)).length).toBe(111));
  it("gives the class with the largest length", () =>
    expect(
      props(
        way("residential", undefined, 0.001),
        way("primary", undefined, 0.002),
        way("residential", undefined, 0.0005),
      ).highway,
    ).toBe("primary"));
  it("gives the largest lanes value", () =>
    expect(props(way("primary", "2", 0.001), way("primary", "4", 0.001), way("primary", "3", 0.001)).lanes).toBe(4));
  it("counts a missing lanes value as 1", () => expect(props(way("primary", undefined, 0.001)).lanes).toBe(1));
  it("counts a lanes value that is not a number as 1", () =>
    expect(props(way("primary", "two", 0.001), way("primary", "2;3", 0.001)).lanes).toBe(1));
});
