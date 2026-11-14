import { expect, test } from "@playwright/test";
import { streetsFromGeoJson } from "../../src/quiz";

// The answer with a tap on one of four options (#39). No request to a map or data service (P3).
const STYLE = { version: 8, sources: {}, layers: [{ id: "background", type: "background" }] };

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test("play one street in easy: a wrong tap marks the correct button, the next street uses the mode", async ({
  page,
}) => {
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
  await expect(page.locator("#answer")).toBeVisible();
  await expect(page.locator(".option")).toHaveCount(0);

  await page.getByLabel("easy").check({ force: true });
  await expect(page.locator(".option")).toHaveCount(4);
  await expect(page.locator("#answer")).toBeHidden();
  const name = streets[Number(await page.locator("#app").getAttribute("data-street"))].name;
  await page.locator(".option", { hasNotText: name }).first().tap();
  await expect(page.locator("#feedback")).toHaveText(name);
  await expect(page.locator(".option.wrong")).toHaveCount(1);
  await expect(page.locator(".option.correct")).toHaveText(name);

  await page.locator(".option").first().tap();
  await expect(page.locator("#feedback")).toHaveText("");
  await expect(page.locator(".option")).toHaveCount(4);
  const next = streets[Number(await page.locator("#app").getAttribute("data-street"))].name;
  await page.locator(".option", { hasText: next }).first().tap();
  await expect(page.locator("#feedback")).toHaveText("Right!");
  await expect(page.locator(".option.correct")).toHaveCount(1);
});
