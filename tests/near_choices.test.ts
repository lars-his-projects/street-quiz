import { describe, expect, it } from "vitest";
import { nearChoices, type Street } from "../src/quiz";

const at = (name: string, x: number): Street => ({
  name,
  lines: [
    [
      [x, 0],
      [x + 0.001, 0],
    ],
  ],
});

const streets = [at("Target", 0), at("Near A", 1), at("Near B", 2), at("Near C", 3), at("Far", 50), at("Far Away", 60)];

describe("nearChoices", () => {
  it("gives the name and the 3 nearest names", () => {
    const result = nearChoices(streets, streets[0], () => 0.5);
    expect([...result].sort()).toEqual(["Near A", "Near B", "Near C", "Target"]);
  });

  it("skips a name that is the same after normalize", () => {
    const list = [
      at("Target", 0),
      at("NEAR a", 1),
      at("Near À", 1.5),
      at("Target", 2),
      at("Next", 3),
      at("Last", 4),
      at("Far", 50),
    ];
    const result = nearChoices(list, list[0], () => 0.5);
    expect(result).toHaveLength(4);
    expect(result).toContain("Next");
    expect(result).not.toContain("Far");
    expect(result.filter((n) => n === "Target")).toHaveLength(1);
  });

  it("gives fewer names when the area has fewer streets", () => {
    expect(nearChoices(streets.slice(0, 2), streets[0], () => 0)).toHaveLength(2);
  });

  it("puts the correct name at each position", () => {
    const positions = new Set<number>();
    for (const r of [0, 0.3, 0.6, 0.99]) {
      positions.add(nearChoices(streets, streets[0], () => r).indexOf("Target"));
    }
    expect(positions.size).toBeGreaterThan(1);
  });
});
