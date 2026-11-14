import "./style.css";
import type { GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { createMap } from "./map";
import { bounds, check, nextStreet, type Street, streetsFromGeoJson } from "./quiz";

/** The stored area: the Jordaan in Amsterdam (`scripts/fetch_area.py 12011952 jordaan`, #8). */
const AREA = "jordaan";
const FLASH_MS = 700;
const WRONG_MS = 1800;

const app = document.querySelector<HTMLElement>("#app");
const form = document.querySelector<HTMLFormElement>("#quiz");
const input = document.querySelector<HTMLInputElement>("#answer");
const feedback = document.querySelector<HTMLElement>("#feedback");

function streetData(street: Street) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "MultiLineString" as const, coordinates: street.lines },
  };
}

async function start(): Promise<void> {
  if (!app || !form || !input || !feedback) return;
  const map = createMap(app);
  const response = await fetch(`${import.meta.env.BASE_URL}areas/${AREA}.geojson`);
  const streets = streetsFromGeoJson(await response.json());
  let street = nextStreet(streets);
  let busy = false;

  const show = () => {
    map.getSource<GeoJSONSource>("street")?.setData(streetData(street));
    app.dataset.street = String(streets.indexOf(street));
    map.fitBounds(bounds(street) as LngLatBoundsLike, { padding: 80, maxZoom: 17, duration: 400 });
  };

  map.on("load", () => {
    map.addSource("street", { type: "geojson", data: streetData(street) });
    map.addLayer({
      id: "street",
      type: "line",
      source: "street",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#e6007e", "line-width": 9, "line-opacity": 0.9 },
    });
    show();
  });

  // A mark for the browser test (`tests/browser/round.spec.ts`): the index of the marked street, and
  // `drawn` when the map is idle and drew it.
  map.on("idle", () => {
    const drawn = map.getLayer("street") !== undefined && map.queryRenderedFeatures({ layers: ["street"] }).length > 0;
    app.dataset.drawn = String(drawn);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (busy || input.value.trim() === "") return;
    busy = true;
    const right = check(input.value, street);
    form.className = right ? "right" : "wrong";
    feedback.textContent = right ? "Right!" : street.name;
    setTimeout(
      () => {
        form.className = "";
        feedback.textContent = "";
        input.value = "";
        street = nextStreet(streets, street);
        show();
        busy = false;
        input.focus();
      },
      right ? FLASH_MS : WRONG_MS,
    );
  });
  input.focus();
}

start();
