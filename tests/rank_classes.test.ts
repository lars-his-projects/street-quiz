import { describe, expect, test } from "vitest";
import { overpassToStreets } from "../src/overpass";
import { byRank } from "../src/rank";
import sample from "./fixtures/overpass_classes.json";

// A stored sample with main streets of several classes (#55). The test sends no request (P3).
const streets = overpassToStreets(sample).features.map((f) => f.properties);
const named = (name: string) => streets.find((s) => s.name === name);

describe("rank on a stored sample with several classes", () => {
  test("the sample has each class, and one street with 2 lanes", () => {
    expect(new Set(streets.map((s) => s.highway))).toEqual(
      new Set(["primary", "secondary", "tertiary", "residential", "living_street"]),
    );
    expect(named("Hoofdweg")?.lanes).toBe(2);
  });

  test("the order follows the classes", () => {
    expect(byRank(streets).map((s) => s.name)).toEqual([
      "Hoofdweg",
      "Middenlaan",
      "Kruisstraat",
      "Lange Dwarsstraat",
      "Kinderpad",
    ]);
  });

  test("a long residential street ranks below a short primary street", () => {
    const residential = named("Lange Dwarsstraat");
    const primary = named("Hoofdweg");
    expect(residential?.length).toBeGreaterThan(primary?.length ?? Infinity);
    const names = byRank(streets).map((s) => s.name);
    expect(names.indexOf("Hoofdweg")).toBeLessThan(names.indexOf("Lange Dwarsstraat"));
  });
});
