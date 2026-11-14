import "./style.css";
import type { GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { createMap } from "./map";
import { bounds, check, nextStreet, type Street, streetsFromGeoJson } from "./quiz";

/** The stored area. The owner's area file replaces the sample (#8). */
const AREA = "sample";
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
