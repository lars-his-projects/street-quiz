import { expect, type Page, test } from "@playwright/test";
import SEVERAL from "../fixtures/nominatim_several.json" with { type: "json" };
import EXPECTED from "../fixtures/overpass_sample.expected.json" with { type: "json" };
import OVERPASS from "../fixtures/overpass_sample.json" with { type: "json" };

// The start with the name of an area (#32). Nominatim and Overpass get stored responses: no real request (P3).
const NAMES = EXPECTED.features.map((f) => f.properties.name);
const STYLE = { version: 8, sources: {}, layers: [{ id: "background", type: "background" }] };

/** Route the services. `overpass` gives the answer of each Overpass request; the return counts the requests. */
async function routeServices(page: Page, overpass: () => "answer" | "fail"): Promise<{ overpass: number }> {
  const count = { overpass: 0 };
  await page.route(
    (url) => url.hostname !== "localhost",
    (route) => {
      const url = route.request().url();
      if (url.startsWith("https://tiles.openfreemap.org/styles/")) return route.fulfill({ json: STYLE });
      if (url.startsWith("https://nominatim.openstreetmap.org/search")) return route.fulfill({ json: SEVERAL });
      if (url.includes("/api/interpreter")) {
        count.overpass++;
        return overpass() === "answer" ? route.fulfill({ json: OVERPASS }) : route.fulfill({ status: 504 });
      }
      return route.abort();
    },
  );
  return count;
}

/** Type a name, select the second area of the list, and wait for the quiz. */
async function startArea(page: Page): Promise<void> {
  await page.goto("./");
  await page.locator("#start input").fill("Springfield");
  await page.locator("#start input").press("Enter");
  await expect(page.locator("#start .areas button")).toHaveCount(2);
  await page.locator("#start .areas button").nth(1).click();
}

test("type a name, select an area and play one street; a second start uses the store", async ({ page }) => {
  const count = await routeServices(page, () => "answer");
  await startArea(page);
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
  const name = NAMES[Number(await page.locator("#app").getAttribute("data-street"))];
  await page.locator("#answer").fill(name);
  await page.locator("#answer").press("Enter");
  await expect(page.locator("#feedback")).toHaveText("Right!");
  expect(count.overpass).toBe(1);

  await startArea(page);
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
  expect(count.overpass).toBe(1);
});

test("a service error shows a text, and the user can try again", async ({ page }) => {
  let fail = true;
  await routeServices(page, () => (fail ? "fail" : "answer"));
  await startArea(page);
  await expect(page.locator("#start .status")).toHaveText(/did not answer/);
  fail = false;
  await page.locator("#start .areas button").first().click();
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
});
