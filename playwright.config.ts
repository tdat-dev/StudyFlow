import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    headless: false,
  },
  expect: {
    timeout: 5_000,
  },
  reporter: [['list']],
});
