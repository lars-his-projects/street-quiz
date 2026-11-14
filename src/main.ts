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

  const fitStreet = (duration: number) =>
    map.fitBounds(bounds(street) as LngLatBoundsLike, { padding: 80, maxZoom: 17, duration });
  const show = () => {
    map.getSource<GeoJSONSource>("street")?.setData(streetData(street));
    app.dataset.street = String(streets.indexOf(street));
    delete app.dataset.drawn;
    fitStreet(400);
  };

  // A phone keyboard makes only the visual viewport smaller (#15): the page follows its height and does not
  // scroll, so the map and the form fill the part that the user sees. After each change of the map size, fit the
  // street again.
  const viewport = window.visualViewport;
  if (viewport) {
    const follow = () => {
      document.body.style.height = `${viewport.height}px`;
      window.scrollTo(0, 0);
    };
    viewport.addEventListener("resize", follow);
    viewport.addEventListener("scroll", follow);
    follow();
  }
  map.on("resize", () => {
    if (map.getLayer("street")) fitStreet(0);
  });

  // The style can load before the streets: then the event `load` came already (#15).
  const addStreet = () => {
    map.addSource("street", { type: "geojson", data: streetData(street) });
    map.addLayer({
      id: "street",
      type: "line",
      source: "street",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#e6007e", "line-width": 9, "line-opacity": 0.9 },
    });
    show();
  };
  if (map.isStyleLoaded()) addStreet();
  else map.once("load", addStreet);

  // A mark for the browser test (`tests/browser/round.spec.ts`): the index of the marked street, `drawn` when the map is idle and
  // drew it, and `box` (the box of the street on the map in pixels: left top right bottom).
  map.on("idle", () => {
    const drawn = map.getLayer("street") !== undefined && map.queryRenderedFeatures({ layers: ["street"] }).length > 0;
    app.dataset.drawn = String(drawn);
    const [west, south, east, north] = bounds(street);
    const a = map.project([west, north]);
    const b = map.project([east, south]);
    app.dataset.box = [a.x, a.y, b.x, b.y].map(Math.round).join(" ");
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
