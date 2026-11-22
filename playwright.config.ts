import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the production build (`npm run build` first). Desktop runs at 1440 px with a mouse,
 * mobile at 390 px with touch. PLAYWRIGHT_CHROMIUM lets a machine point at an already installed Chromium.
 */
const PORT = 3123;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3, // timing checks (the curtain) need a CPU that is not starved
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", launchOptions: { executablePath } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
  webServer: { command: `npm run start -- -p ${PORT}`, port: PORT, reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
