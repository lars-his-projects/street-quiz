import "./style.css";
import "./style-page.css";
import type { LngLatBoundsLike } from "maplibre-gl";
import { createForm, type QuizForm, showResult } from "./form";
import { addStreetLayer, createMap } from "./map";
import { bounds, streetsFromGeoJson } from "./quiz";
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

async function start(): Promise<void> {
  const main = document.querySelector<HTMLElement>("#components");
  if (!main) return;

  const mapBox = document.createElement("div");
  mapBox.className = "map";
  main.append(
    section("Marked street on the map, with the attribution", mapBox),
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
