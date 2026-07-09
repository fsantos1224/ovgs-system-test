import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  webServer: [
    {
      command: 'node server.cjs',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'npx vite --port 4173',
      port: 4173,
      reuseExistingServer: true,
    },
  ],
  use: {
    baseURL: 'http://localhost:4173',
  },
});
