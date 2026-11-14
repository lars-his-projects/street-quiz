import { describe, expect, test } from "vitest";
import jordaan from "../public/areas/jordaan.geojson?raw";
import { byRank, CLASS_WEIGHT, type RankValues, rank } from "../src/rank";

// The rank of a street (#44): length × class weight × lanes factor.
const street = (highway: string, length = 500, lanes = 1) => ({ highway, length, lanes });

describe("rank", () => {
  test("the classes go from large to small", () => {
    const order = ["primary", "secondary", "tertiary", "residential", "living_street"];
    const ranked = byRank(order.map((h) => street(h))).map((s) => s.highway);
    expect(ranked).toEqual(order);
    for (const h of ["motorway", "trunk"]) expect(rank(street(h))).toBe(rank(street("primary")));
    for (const h of ["pedestrian", "service", "footway", "cycleway"]) expect(CLASS_WEIGHT[h]).toBeLessThan(1);
    expect(rank(street("unclassified"))).toBe(rank(street("residential")));
  });

  test("a long residential street is below a short secondary street with 2 lanes", () => {
    expect(rank(street("residential", 1500))).toBeLessThan(rank(street("secondary", 300, 2)));
  });

  test("more lanes give a higher rank, and missing values give a rank", () => {
    expect(rank(street("tertiary", 500, 2))).toBeGreaterThan(rank(street("tertiary", 500, 1)));
    expect(rank({})).toBe(0);
    expect(rank({ length: 100 })).toBe(100);
  });
});

test("in the stored Jordaan, Rozengracht ranks above the quays", () => {
  const names = byRank(
    (JSON.parse(jordaan) as { features: { properties: RankValues & { name: string } }[] }).features.map(
      (f) => f.properties,
    ),
  ).map((p) => p.name);
  const quays = ["Prinsengracht", "Keizersgracht", "Herengracht"].filter((n) => names.includes(n));
  expect(quays.length).toBeGreaterThan(0);
  for (const quay of quays) expect(names.indexOf("Rozengracht")).toBeLessThan(names.indexOf(quay));
});
