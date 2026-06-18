import { Page } from '@playwright/test';

export function generateUniqueEmail(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6);
  return `test-${ts}-${rand}@devai-test.com`;
}

export function generateTestPassword(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  return `Test${rand}A1!`;
}

export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

export async function setupAdminSession(page: Page, token: string) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate((t) => {
    localStorage.setItem('devai_auth_token', t);
    document.cookie = `devai_auth_token=${t}; path=/; max-age=86400; SameSite=Lax`;
  }, token);
}
