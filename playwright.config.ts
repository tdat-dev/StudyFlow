import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
  },
  expect: {
    timeout: 5_000,
  },
  reporter: [['list']],
});
