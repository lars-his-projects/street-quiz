import "./style.css";
import type { GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { streetsOfArea } from "./area";
import { createForm, markOptions, selectedMode, showMode, showResult } from "./form";
import { type AreaResult, findAreas } from "./geocode";
import { addStreetLayer, createMap, FIT_OPTIONS, streetData } from "./map";
import { bounds, check, choices, nearChoices, nextStreet, type Street, streetsFromGeoJson } from "./quiz";
import { createStartForm, showAreas, showStatus } from "./start";
import { token } from "./theme";

/**
 * A stored area of `public/areas/`: `?area=jordaan` starts the quiz with it at once (the browser tests, #32).
 * The Jordaan in Amsterdam: `scripts/fetch_area.py 12011952 jordaan` (#8).
 */
const STORED = new Set(["jordaan"]);

/** The first screen: the user types the name of an area, selects it, and the quiz starts with its streets (#32). */
async function start(): Promise<void> {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) return;
  const slug = new URLSearchParams(window.location.search).get("area") ?? "";
  if (STORED.has(slug)) {
    const response = await fetch(`${import.meta.env.BASE_URL}areas/${slug}.geojson`);
    return play(app, streetsFromGeoJson(await response.json()));
  }
  const startForm = createStartForm();
  const { form, input } = startForm;
  form.id = "start";
  document.body.append(form);
  let busy = false;

  const pick = async (area: AreaResult) => {
    if (busy) return;
    busy = true;
    showAreas(startForm, [], pick);
    showStatus(startForm, "wait", `Loading the streets of ${area.name}…`);
    try {
      const streets = streetsFromGeoJson(await streetsOfArea(area.relation));
      if (streets.length === 0) {
        showStatus(startForm, "error", `${area.name} has no street for the quiz. Try another area.`);
      } else {
        form.remove();
        return play(app, streets);
      }
    } catch {
      showStatus(startForm, "error", "The street service did not answer. Try again.");
      showAreas(startForm, [area], pick);
    } finally {
      busy = false;
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || input.value.trim() === "") return;
    busy = true;
    showAreas(startForm, [], pick);
    showStatus(startForm, "wait", "Searching…");
    let areas: AreaResult[] = [];
    try {
      areas = await findAreas(input.value);
    } catch {
      busy = false;
      return showStatus(startForm, "error", "The search service did not answer. Try again.");
    }
    busy = false;
    if (areas.length === 0) return showStatus(startForm, "error", "No area has this name. Try another name.");
    if (areas.length === 1) return pick(areas[0]);
    showStatus(startForm, "", "Select the area:");
    showAreas(startForm, areas, pick);
  });
  input.focus();
}

/** Play the quiz with the streets of an area. */
function play(app: HTMLElement, streets: Street[]): void {
  const quiz = createForm();
  const { form, input } = quiz;
  // The ids are for the browser test (`tests/browser/round.spec.ts`); the CSS uses the classes.
  form.id = "quiz";
  input.id = "answer";
  quiz.feedback.id = "feedback";
  document.body.append(form);
  let street = nextStreet(streets);
  // The map starts at the first street: it asks for no tile of another place, and it makes no move (#16).
  const map = createMap(app, bounds(street) as LngLatBoundsLike);
  const start = map.getCenter();
  app.dataset.start = `${start.lng} ${start.lat}`;
  // After an answer, the result stays on screen until the user goes on (#23): the button then says "Next".
  let answered = false;
  const button = form.querySelector<HTMLButtonElement>("button");

  const fitStreet = (duration: number) =>
    map.fitBounds(bounds(street) as LngLatBoundsLike, { ...FIT_OPTIONS, duration });
  let first = true;
  // The mode of the switch (#39): a change applies to the next street.
  const tap = (name: string) => {
    if (answered) return goNext();
    answered = true;
    const right = check(name, street);
    markOptions(quiz, name, street.name);
    showResult(quiz, right ? "right" : "wrong", right ? "Right!" : street.name);
  };
  const showOptions = () => {
    const mode = selectedMode(quiz);
    const names = mode === "easy" ? choices(streets, street) : mode === "hard" ? nearChoices(streets, street) : [];
    showMode(quiz, mode, names, tap);
  };
  const show = () => {
    showOptions();
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

  const goNext = () => {
    showResult(quiz, "", "");
    input.value = "";
    input.readOnly = false;
    if (button) button.textContent = "OK";
    street = nextStreet(streets, street);
    show();
    answered = false;
    if (selectedMode(quiz) === "type") input.focus();
  };
  form.addEventListener("change", (event) => {
    if ((event.target as HTMLInputElement).name !== "mode" || answered) return;
    showOptions();
    if (selectedMode(quiz) === "type") input.focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (answered) return goNext();
    if (input.value.trim() === "") return;
    answered = true;
    const right = check(input.value, street);
    showResult(quiz, right ? "right" : "wrong", right ? "Right!" : street.name);
    // Read only keeps the phone keyboard open, and Enter still goes on.
    input.readOnly = true;
    if (button) button.textContent = "Next";
  });
  input.focus();
}

start();
