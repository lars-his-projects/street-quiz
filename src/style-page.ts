import "./style.css";
import "./style-page.css";
import type { LngLatBoundsLike } from "maplibre-gl";
import { createForm, markOptions, type QuizForm, showMode, showResult } from "./form";
import { addStreetLayer, createMap } from "./map";
import { bounds, streetsFromGeoJson } from "./quiz";
import { createStartForm, type StartForm, showAreas, showStatus } from "./start";
import { token } from "./theme";

/** The style page (#17): each component of the app in each state. */
const AREA = "jordaan";

function section(title: string, body: HTMLElement): HTMLElement {
  const part = document.createElement("section");
  const heading = document.createElement("h2");
  heading.textContent = title;
  part.append(heading, body);
  return part;
}

function formIn(state: (quiz: QuizForm) => void): HTMLElement {
  const quiz = createForm();
  quiz.form.addEventListener("submit", (event) => event.preventDefault());
  state(quiz);
  return quiz.form;
}

function startIn(state: (start: StartForm) => void): HTMLElement {
  const start = createStartForm();
  start.form.addEventListener("submit", (event) => event.preventDefault());
  state(start);
  return start.form;
}

const SPRINGFIELD = [
  { name: "Springfield", label: "Springfield, Greene County, Missouri, United States", relation: 1 },
  { name: "Springfield", label: "Springfield, Sangamon County, Illinois, United States", relation: 2 },
];

const NAMES = ["Keizersgracht", "Prinsengracht", "Herengracht", "Bloemgracht"];

async function start(): Promise<void> {
  const main = document.querySelector<HTMLElement>("#components");
  if (!main) return;

  const mapBox = document.createElement("div");
  mapBox.className = "map";
  main.append(
    section("Marked street on the map, with the attribution", mapBox),
    section(
      "Start form: empty",
      startIn(() => {}),
    ),
    section(
      "Start form: a list of areas",
      startIn((s) => {
        s.input.value = "Springfield";
        showStatus(s, "", "Select the area:");
        showAreas(s, SPRINGFIELD, () => {});
      }),
    ),
    section(
      "Start form: wait",
      startIn((s) => {
        s.input.value = "Jordaan";
        showStatus(s, "wait", "Loading the streets of Jordaan…");
      }),
    ),
    section(
      "Start form: error",
      startIn((s) => {
        s.input.value = "Jordaan";
        showStatus(s, "error", "The street service did not answer. Try again.");
      }),
    ),
    section(
      "Answer form: empty",
      formIn(() => {}),
    ),
    section(
      "Answer form: with text",
      formIn((q) => {
        q.input.value = "Prinsengracht";
      }),
    ),
    section(
      "Answer form: right",
      formIn((q) => {
        q.input.value = "Prinsengracht";
        showResult(q, "right", "Right!");
      }),
    ),
    section(
      "Answer form: easy, four options",
      formIn((q) => {
        q.form.querySelector<HTMLInputElement>('input[value="easy"]')?.click();
        showMode(q, "easy", NAMES, () => {});
      }),
    ),
    section(
      "Answer form: hard, a long name wraps inside its option button",
      formIn((q) => {
        q.form.querySelector<HTMLInputElement>('input[value="hard"]')?.click();
        showMode(q, "hard", ["Tweede Egelantiersdwarsstraat", ...NAMES.slice(0, 3)], () => {});
      }),
    ),
    section(
      "Answer form: hard, a wrong tap (the correct option has a mark)",
      formIn((q) => {
        q.form.querySelector<HTMLInputElement>('input[value="hard"]')?.click();
        showMode(q, "hard", NAMES, () => {});
        markOptions(q, "Keizersgracht", "Prinsengracht");
        showResult(q, "wrong", "Prinsengracht");
      }),
    ),
    section(
      "Answer form: easy, a right tap",
      formIn((q) => {
        q.form.querySelector<HTMLInputElement>('input[value="easy"]')?.click();
        showMode(q, "easy", NAMES, () => {});
        markOptions(q, "Prinsengracht", "Prinsengracht");
        showResult(q, "right", "Right!");
      }),
    ),
    section(
      "Answer form: wrong (the feedback text gives the right name)",
      formIn((q) => {
        q.input.value = "Keizersgracht";
        showResult(q, "wrong", "Prinsengracht");
      }),
    ),
  );

  const response = await fetch(`${import.meta.env.BASE_URL}areas/${AREA}.geojson`);
  const streets = streetsFromGeoJson(await response.json());
  const street = streets.find((s) => s.name === "Prinsengracht") ?? streets[0];
  const map = createMap(mapBox, bounds(street) as LngLatBoundsLike);
  map.on("load", () => {
    addStreetLayer(map, street.lines, token("--color-street"));
    map.fitBounds(bounds(street) as LngLatBoundsLike, { padding: 40, maxZoom: 17, duration: 0 });
  });
}

start();
