import { expect, test } from "@playwright/test";

// A long street name stays inside its option button on a phone (#51). No request to a service (P3).
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test("a long name stays inside its option button", async ({ page }) => {
  await page.goto("./style.html");
  const buttons = page.locator(".option", { hasText: "Tweede Egelantiersdwarsstraat" });
  await expect(buttons).toHaveCount(1);
  const fits = await buttons.evaluate((el) => el.scrollWidth <= el.clientWidth);
  expect(fits).toBe(true);
});
