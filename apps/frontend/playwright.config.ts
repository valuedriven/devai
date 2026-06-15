import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const projectRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: '**/*.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'playwright/.clerk/user.json'),
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'npm run dev:backend',
      url: 'http://localhost:3001/api/v1',
      reuseExistingServer: !process.env.CI,
      cwd: projectRoot,
    },
    {
      command: 'npm run dev:frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      cwd: projectRoot,
    },
  ],
});
