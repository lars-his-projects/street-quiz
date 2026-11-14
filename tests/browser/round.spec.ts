import { expect, type Page, test } from "@playwright/test";
import { type Street, streetsFromGeoJson } from "../../src/quiz";

// A browser test of the built app (#14). It sends no request to a map or data service (P3): the style of the map
// is a stored style with no tiles, and the streets come from `public/areas/`.
const STYLE = {
  version: 8,
  sources: {
    empty: {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#eee" } },
    { id: "roads", type: "line", source: "empty" },
  ],
};

/** Open the app, record the faults and give the map the stored style. */
async function open(page: Page, faults: string[]): Promise<Street[]> {
  page.on("console", (message) => {
    if (message.type() === "error") faults.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => faults.push(`page error: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) faults.push(`status ${response.status()}: ${response.url()}`);
  });
  await page.route("https://tiles.openfreemap.org/styles/liberty", (route) => route.fulfill({ json: STYLE }));
  await page.route(
    (url) => url.hostname !== "localhost" && url.href !== "https://tiles.openfreemap.org/styles/liberty",
    (route) => {
      faults.push(`outside request: ${route.request().url()}`);
      return route.abort();
    },
  );
  const area = await page.request.get("areas/jordaan.geojson");
  await page.goto("./");
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
  return streetsFromGeoJson(await area.json());
}

/** Fail when the boxes of the map attribution and the answer form touch. */
async function expectApart(page: Page): Promise<void> {
  const attribution = await page.locator(".maplibregl-ctrl-attrib").boundingBox();
  const quiz = await page.locator("#quiz").boundingBox();
  expect(attribution).not.toBeNull();
  expect(quiz).not.toBeNull();
  if (!attribution || !quiz) return;
  const apart =
    attribution.x + attribution.width <= quiz.x ||
    quiz.x + quiz.width <= attribution.x ||
    attribution.y + attribution.height <= quiz.y ||
    quiz.y + quiz.height <= attribution.y;
  expect(apart, `attribution ${JSON.stringify(attribution)} touches the form ${JSON.stringify(quiz)}`).toBe(true);
}

test.describe("at a phone size", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("the map draws the street, and a round works", async ({ page }) => {
    const faults: string[] = [];
    const streets = await open(page, faults);
    await expectApart(page);

    const shown = async () => streets[Number(await page.locator("#app").getAttribute("data-street"))];
    const first = await shown();
    await page.locator("#answer").fill("No Such Street");
    await page.locator("#answer").press("Enter");
    await expect(page.locator("#feedback")).toHaveText(first.name);
    await expect(page.locator("#feedback")).toHaveText("", { timeout: 5_000 });
    const second = await shown();
    expect(second).not.toBe(first);

    await page.locator("#answer").fill(second.name);
    await page.locator("#answer").press("Enter");
    await expect(page.locator("#feedback")).toHaveText("Right!");
    await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true");
    expect(faults).toEqual([]);
  });
});

test.describe("at a computer size", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no map control is on the answer form", async ({ page }) => {
    const faults: string[] = [];
    await open(page, faults);
    await expectApart(page);
    expect(faults).toEqual([]);
  });
});
