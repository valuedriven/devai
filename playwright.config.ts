import { defineConfig } from '@playwright/test';
import baseConfig from './apps/frontend/playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './apps/frontend',
});
