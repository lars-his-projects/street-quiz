import { expect, test } from "@playwright/test";
import { streetsFromGeoJson } from "../../src/quiz";

// The map starts at the first street, inside the stored area, with no move (#16). The style has no tile source, so
// the test reads the first position of the map from `data-start` of `#app`, not the tile requests.
const STYLE = { version: 8, sources: {}, layers: [{ id: "background", type: "background" }] };

test("the first position of the map is inside the stored area", async ({ page }) => {
  await page.route(
    (url) => url.hostname !== "localhost",
    (route) =>
      route.request().url().startsWith("https://tiles.openfreemap.org/styles/")
        ? route.fulfill({ json: STYLE })
        : route.abort(),
  );
  const area = streetsFromGeoJson(await (await page.request.get("areas/jordaan.geojson")).json());
  const points = area.flatMap((street) => street.lines.flat());
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  await page.goto("./?area=jordaan");
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
  const [lng, lat] = ((await page.locator("#app").getAttribute("data-start")) ?? "").split(" ").map(Number);
  expect(lng).toBeGreaterThanOrEqual(Math.min(...lngs));
  expect(lng).toBeLessThanOrEqual(Math.max(...lngs));
  expect(lat).toBeGreaterThanOrEqual(Math.min(...lats));
  expect(lat).toBeLessThanOrEqual(Math.max(...lats));
});
