import { defineConfig } from "vitest/config";

// CSS on: `tests/theme_tokens.test.ts` reads `src/style.css?raw`. Only tests/**/*.test.ts: the Playwright tests
// (tests/browser/*.spec.ts) run with `npx playwright test`.
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], css: true },
});
