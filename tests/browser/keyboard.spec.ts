import { expect, type Page, test } from "@playwright/test";

// A phone keyboard makes the visible part of the page smaller (#15). The test makes the window smaller in its place.
/** The padding of `show()` in `src/main.ts`, less 2 pixels for the rounding. */
const PADDING = 78;
const STYLE = { version: 8, sources: {}, layers: [{ id: "background", type: "background" }] };

/** Wait until the map is idle with the street, and return the box of the street on the map in pixels. */
async function streetBox(page: Page): Promise<number[]> {
  await expect(page.locator("#app")).toHaveAttribute("data-drawn", "true", { timeout: 20_000 });
  return ((await page.locator("#app").getAttribute("data-box")) ?? "").split(" ").map(Number);
}

/** Fail when the street is not in the map with the padding of `show()`, or the page scrolls. */
async function expectInView(page: Page): Promise<void> {
  const height = page.viewportSize()?.height ?? 0;
  const map = await page.locator("#app").boundingBox();
  const quiz = await page.locator("#quiz").boundingBox();
  expect(map && quiz).toBeTruthy();
  if (!map || !quiz) return;
  expect(map.y).toBe(0);
  expect(Math.abs(quiz.y + quiz.height - height)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const [left, top, right, bottom] = await streetBox(page);
  expect(left).toBeGreaterThanOrEqual(PADDING);
  expect(top).toBeGreaterThanOrEqual(PADDING);
  expect(right).toBeLessThanOrEqual(map.width - PADDING);
  expect(bottom).toBeLessThanOrEqual(map.height - PADDING);
  expect(right - left > 0 || bottom - top > 0).toBe(true);
}

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test("the street stays in view when the visible height becomes smaller", async ({ page }) => {
  test.setTimeout(120_000);
  await page.route(
    (url) => url.hostname !== "localhost",
    (route) =>
      route.request().url().startsWith("https://tiles.openfreemap.org/styles/")
        ? route.fulfill({ json: STYLE })
        : route.abort(),
  );
  await page.goto("./");
  // A tall street does not fit into the small map with no new fit: skip the short streets with a wrong answer.
  for (let round = 0; round < 30; round++) {
    const [, top, , bottom] = await streetBox(page);
    if (bottom - top > 250) break;
    await page.locator("#answer").fill("No Such Street");
    await page.locator("#answer").press("Enter");
    await expect(page.locator("#feedback")).not.toHaveText("");
    await page.locator("#answer").press("Enter");
    await expect(page.locator("#feedback")).toHaveText("");
    await page.waitForTimeout(500);
  }
  await expectInView(page);
  const [, top, , bottom] = await streetBox(page);
  expect(bottom - top).toBeGreaterThan(250);
  await page.setViewportSize({ width: 390, height: 500 });
  await expect.poll(async () => (await page.locator("#quiz").boundingBox())?.y ?? 0).toBeLessThan(500);
  await page.waitForTimeout(500);
  await expectInView(page);
});
