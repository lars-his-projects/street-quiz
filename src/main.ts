import "./style.css";
import { createMap } from "./map";

const app = document.querySelector<HTMLElement>("#app");
if (app) {
  createMap(app);
}
