import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  webServer: { command: 'npm run dev -- --port 5173 --host 127.0.0.1', port: 5173, reuseExistingServer: !process.env.CI, timeout: 120000 },
  use: { baseURL: 'http://127.0.0.1:5173' }
})
