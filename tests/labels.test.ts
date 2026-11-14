import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import { hideLabels } from "../src/labels";

const style: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    { id: "background", type: "background" },
    { id: "road", type: "line", source: "s", "source-layer": "transportation" },
    { id: "road-name", type: "symbol", source: "s", layout: { "text-field": "{name}" } },
    { id: "place-name", type: "symbol", source: "s", layout: { "text-field": ["get", "name"] } },
    { id: "poi-icon", type: "symbol", source: "s", layout: { "icon-image": "dot" } },
  ],
};

describe("hideLabels", () => {
  it("removes the text layers and keeps the other layers", () => {
    expect(hideLabels(style).layers.map((l) => l.id)).toEqual(["background", "road", "poi-icon"]);
  });

  it("does not change the input style", () => {
    hideLabels(style);
    expect(style.layers).toHaveLength(5);
  });
});
