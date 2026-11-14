import { defineConfig, devices } from "@playwright/test";

// The browser tests (`npx playwright test`): they open the built app with `vite preview` (#14).
// A cloud session has the browser in /opt/pw-browsers (PLAYWRIGHT_BROWSERS_PATH); CI installs it.
export default defineConfig({
  testDir: "tests/browser",
  timeout: 60_000,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://localhost:4173/street-quiz/", trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/street-quiz/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
