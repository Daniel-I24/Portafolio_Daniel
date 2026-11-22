import { defineConfig } from "vitest/config";

// Unit tests live next to lib/; e2e/ belongs to Playwright (npm run test:e2e).
export default defineConfig({ test: { include: ["lib/**/*.test.ts"] } });
