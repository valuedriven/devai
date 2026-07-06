import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const backendDir = path.resolve(__dirname, '../backend');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 60_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run prisma:generate && npx nest start',
      url: 'http://127.0.0.1:3001/api/v1/products',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      cwd: backendDir,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'tests/.auth/admin.json'),
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: 'customer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'tests/.auth/customer.json'),
      },
      dependencies: ['setup'],
      testIgnore: [
        /auth\.setup\.ts/,
        /category-management\.spec\.ts/,
        /customer-management\.spec\.ts/,
        /product-management\.spec\.ts/,
        /order-management\.spec\.ts/,
        /order-lifecycle\.spec\.ts/
      ],
    },
    {
      name: 'cicd',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'tests/.auth/admin.json'),
      },
      dependencies: ['setup'],
      testMatch: /fluxo-completo-carrinho\.spec\.ts/,
    }
  ],
});

