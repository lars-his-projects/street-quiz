/** The start form: the user types the name of an area and selects it. The app and `style.html` use this markup. */
import type { AreaResult } from "./geocode";

export interface StartForm {
  form: HTMLFormElement;
  input: HTMLInputElement;
  status: HTMLElement;
  list: HTMLElement;
}

export function createStartForm(): StartForm {
  const form = document.createElement("form");
  form.className = "start";
  form.autocomplete = "off";
  form.innerHTML = `<h1>Street quiz</h1>
<div class="row">
  <input class="area" type="text" placeholder="Name of an area" aria-label="Name of an area" enterkeyhint="search" />
  <button type="submit">Go</button>
</div>
<div class="status" aria-live="polite"></div>
<ul class="areas"></ul>`;
  const input = form.querySelector<HTMLInputElement>("input");
  const status = form.querySelector<HTMLElement>(".status");
  const list = form.querySelector<HTMLElement>(".areas");
  if (!input || !status || !list) throw new Error("the start form markup is incomplete");
  return { form, input, status, list };
}

/** Show a status text: "wait", "error" or none. */
export function showStatus(start: StartForm, state: "wait" | "error" | "", text: string): void {
  start.status.className = state ? `status ${state}` : "status";
  start.status.textContent = text;
}

/** Show the areas as buttons. `pick` gets the selected area. */
export function showAreas(start: StartForm, areas: AreaResult[], pick: (area: AreaResult) => void): void {
  start.list.replaceChildren(
    ...areas.map((area) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = area.label || area.name;
      button.addEventListener("click", () => pick(area));
      item.append(button);
      return item;
    }),
  );
}
