import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  // Serial: the specs share one API/database, so run them one at a time.
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  use: {
    // Use localhost (not 127.0.0.1): Next dev blocks cross-origin _next resources
    // from 127.0.0.1 unless whitelisted, which breaks client hydration.
    baseURL: process.env.E2E_WEB_URL ?? 'http://localhost:3011',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm --filter @silence/api build && pnpm --filter @silence/api start',
      url: 'http://127.0.0.1:3010/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @silence/web dev',
      url: 'http://localhost:3011',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
