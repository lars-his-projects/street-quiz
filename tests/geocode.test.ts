import { describe, expect, it } from "vitest";
import { buildSearchUrl, parseSearchResponse } from "../src/geocode";
import jordaan from "./fixtures/nominatim_jordaan.json";
import none from "./fixtures/nominatim_none.json";
import several from "./fixtures/nominatim_several.json";

describe("buildSearchUrl", () => {
  it("builds one search URL with the typed name", () => {
    const url = new URL(buildSearchUrl(" Jordaan "));
    expect(url.origin + url.pathname).toBe("https://nominatim.openstreetmap.org/search");
    expect(url.searchParams.get("format")).toBe("jsonv2");
    expect(url.searchParams.get("q")).toBe("Jordaan");
  });
});

describe("parseSearchResponse", () => {
  it("keeps the relation of Jordaan and leaves out the node", () => {
    expect(parseSearchResponse(jordaan)).toEqual([
      { name: "Jordaan", label: "Jordaan, Amsterdam, Noord-Holland, Nederland", relation: 1234567 },
    ]);
  });

  it("keeps the order of Nominatim and leaves out a way", () => {
    expect(parseSearchResponse(several).map((a) => a.relation)).toEqual([111, 222]);
  });

  it("gives an empty list for no result", () => {
    expect(parseSearchResponse(none)).toEqual([]);
  });
});
