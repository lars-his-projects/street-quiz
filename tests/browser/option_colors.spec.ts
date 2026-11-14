import { expect, test } from "@playwright/test";
import { streetsFromGeoJson } from "../../src/quiz";

// After a tap, the other options show on the map too, and each button has the color dot of its street (#58).
// No request to a map or data service (P3).
const STYLE = { version: 8, sources: {}, layers: [{ id: "background", type: "background" }] };

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test("a tap numbers the three other options and draws them, the next street clears them", async ({ page }) => {
  await page.route(
    (url) => url.hostname !== "localhost",
    (route) =>
      route.request().url().startsWith("https://tiles.openfreemap.org/styles/")
        ? route.fulfill({ json: STYLE })
        : route.abort(),
  );
  const streets = streetsFromGeoJson(await (await page.request.get("areas/jordaan.geojson")).json());
  await page.goto("./?area=jordaan");
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
  await page.getByLabel("easy").check({ force: true });
  await expect(page.locator(".option")).toHaveCount(4);
  await expect(page.locator(".option[data-other]")).toHaveCount(0);
  const name = streets[Number(await page.locator("#app").getAttribute("data-street"))].name;
  await page.locator(".option", { hasText: name }).first().tap();

  await expect(page.locator(".option[data-other]")).toHaveCount(3);
  await expect(page.locator(".option.correct")).not.toHaveAttribute("data-other");
  const numbers = await page.locator(".option[data-other]").evaluateAll((b) => b.map((e) => e.dataset.other));
  expect(numbers).toEqual(["1", "2", "3"]);
  await expect(page.locator("#app")).toHaveAttribute("data-others", "3");
  const dots = await page
    .locator(".option")
    .evaluateAll((b) => b.map((e) => getComputedStyle(e, "::after").backgroundColor));
  expect(new Set(dots).size).toBe(4);

  await page.locator(".option").first().tap();
  await expect(page.locator(".option[data-other]")).toHaveCount(0);
  await expect(page.locator("#app")).not.toHaveAttribute("data-others");
});
