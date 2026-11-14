import { describe, expect, it } from "vitest";
import { streetKind } from "../src/kind";
import { choices, nearChoices } from "../src/quiz";

// The options of a question have the kind of the asked name when possible (#57).
describe("streetKind", () => {
  it.each([
    ["Laurierstraat", "street"],
    ["Eerste Laurierdwarsstraat", "street"],
    ["Bierdragersgang", "street"],
    ["Abbey Road", "street"],
    ["Hauptstraße", "street"],
    ["Marnixplein", "square"],
    ["Noordermarkt", "square"],
    ["Concordiahofje-Noord", "square"],
    ["Hof van Parijs", "square"],
    ["Prinsengracht", "water"],
    ["Westerkade", "water"],
    ["Karthuizersplantsoen", "park"],
    ["Anna", "other"],
  ])("%s is a %s", (name, kind) => {
    expect(streetKind(name)).toBe(kind);
  });
});

const street = (name: string, x = 0) => ({ name, lines: [[[x, 0] as [number, number]]] });

describe("the options use the kind of the street", () => {
  const streets = [
    street("Marnixplein", 0),
    street("Laurierstraat", 1),
    street("Rozenstraat", 2),
    street("Raamplein", 3),
    street("Noordermarkt", 4),
    street("Westerstraat", 5),
    street("Hof van Parijs", 6),
  ];

  it("choices gives only squares for a square when the area has three other squares", () => {
    for (const v of [0, 0.4, 0.9]) {
      const names = choices(streets, streets[0], () => v);
      expect(names.map(streetKind)).toEqual(["square", "square", "square", "square"]);
    }
  });

  it("nearChoices gives the near squares before a nearer street", () => {
    const names = nearChoices(streets, streets[0], () => 0);
    expect([...names].sort()).toEqual(["Hof van Parijs", "Marnixplein", "Noordermarkt", "Raamplein"]);
  });

  it("fills with other kinds when the area has too few of the kind", () => {
    const names = choices(streets.slice(0, 4), streets[0], () => 0);
    expect([...names].sort()).toEqual(["Laurierstraat", "Marnixplein", "Raamplein", "Rozenstraat"]);
  });
});
