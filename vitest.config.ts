import { defineConfig } from "vitest/config";

// Only tests/**/*.test.ts: the Playwright tests (tests/browser/*.spec.ts) run with `npx playwright test`.
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
