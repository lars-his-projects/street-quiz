import { describe, expect, it } from "vitest";
import { normalizeStreetName } from "../src/normalize";
import { check } from "../src/quiz";

describe("ß and ss", () => {
  it("accepts strasse for straße", () => {
    expect(check("auguststrasse", { name: "Auguststraße", lines: [] })).toBe(true);
  });

  it("maps ß to ss", () => {
    expect(normalizeStreetName("Große Straße")).toBe("grosse strasse");
  });
});
