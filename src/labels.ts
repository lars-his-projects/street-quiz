import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

/** Return true when the layer shows text (a `symbol` layer with `text-field`). */
function showsText(layer: LayerSpecification): boolean {
  return layer.type === "symbol" && layer.layout?.["text-field"] !== undefined;
}

/** Return a copy of the style with no text layers: no street names and no place names. */
export function hideLabels(style: StyleSpecification): StyleSpecification {
  return { ...style, layers: style.layers.filter((layer) => !showsText(layer)) };
}
