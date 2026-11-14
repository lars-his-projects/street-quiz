import "./style.css";
import type { GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { createForm, showResult } from "./form";
import { addStreetLayer, createMap, FIT_OPTIONS, streetData } from "./map";
import { bounds, check, nextStreet, streetsFromGeoJson } from "./quiz";
import { token } from "./theme";

/** The stored area: the Jordaan in Amsterdam (`scripts/fetch_area.py 12011952 jordaan`, #8). */
const AREA = "jordaan";
const FLASH_MS = 700;
const WRONG_MS = 1800;

async function start(): Promise<void> {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) return;
  const quiz = createForm();
  const { form, input } = quiz;
  // The ids are for the browser test (`tests/browser/round.spec.ts`); the CSS uses the classes.
  form.id = "quiz";
  input.id = "answer";
  quiz.feedback.id = "feedback";
  document.body.append(form);
  const response = await fetch(`${import.meta.env.BASE_URL}areas/${AREA}.geojson`);
  const streets = streetsFromGeoJson(await response.json());
  let street = nextStreet(streets);
  // The map starts at the first street: it asks for no tile of another place, and it makes no move (#16).
  const map = createMap(app, bounds(street) as LngLatBoundsLike);
  const start = map.getCenter();
  app.dataset.start = `${start.lng} ${start.lat}`;
  let busy = false;

  const fitStreet = (duration: number) =>
    map.fitBounds(bounds(street) as LngLatBoundsLike, { ...FIT_OPTIONS, duration });
  let first = true;
  const show = () => {
    map.getSource<GeoJSONSource>("street")?.setData(streetData(street.lines));
    app.dataset.street = String(streets.indexOf(street));
    delete app.dataset.drawn;
    if (!first) fitStreet(400);
    first = false;
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
    addStreetLayer(map, street.lines, token("--color-street"));
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
    showResult(quiz, right ? "right" : "wrong", right ? "Right!" : street.name);
    setTimeout(
      () => {
        showResult(quiz, "", "");
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
