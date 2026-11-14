import "./style.css";
import type { GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { createForm, showResult } from "./form";
import { addStreetLayer, createMap, streetData } from "./map";
import { bounds, check, nextStreet, streetsFromGeoJson } from "./quiz";
import { applyTheme, token } from "./theme";

/** The stored area: the Jordaan in Amsterdam (`scripts/fetch_area.py 12011952 jordaan`, #8). */
const AREA = "jordaan";
const FLASH_MS = 700;
const WRONG_MS = 1800;

async function start(): Promise<void> {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) return;
  applyTheme(location.search);
  const quiz = createForm();
  const { form, input } = quiz;
  document.body.append(form);
  const map = createMap(app);
  const response = await fetch(`${import.meta.env.BASE_URL}areas/${AREA}.geojson`);
  const streets = streetsFromGeoJson(await response.json());
  let street = nextStreet(streets);
  let busy = false;

  const show = () => {
    map.getSource<GeoJSONSource>("street")?.setData(streetData(street.lines));
    map.fitBounds(bounds(street) as LngLatBoundsLike, { padding: 80, maxZoom: 17, duration: 400 });
  };

  map.on("load", () => {
    addStreetLayer(map, street.lines, token("--color-street"));
    show();
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
