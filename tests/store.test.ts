import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadArea, saveArea } from "../src/store";

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Prinsengracht" },
      geometry: {
        type: "MultiLineString",
        coordinates: [
          [
            [4.88, 52.37],
            [4.89, 52.38],
          ],
        ],
      },
    },
  ],
};

afterEach(() => vi.unstubAllGlobals());

describe("store", () => {
  it("gives the same GeoJSON after a save", async () => {
    await saveArea(271110, geojson);
    expect(await loadArea(271110)).toEqual(geojson);
  });

  it("gives undefined for an unknown id", async () => {
    expect(await loadArea(999)).toBeUndefined();
  });

  it("works with no store when IndexedDB fails", async () => {
    vi.stubGlobal("indexedDB", {
      open: () => {
        throw new Error("private mode");
      },
    });
    await expect(saveArea(1, geojson)).resolves.toBeUndefined();
    await expect(loadArea(1)).resolves.toBeUndefined();
  });
});
