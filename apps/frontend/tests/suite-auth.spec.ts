import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';
import { navigateAndWait } from './helpers';

test.describe('Suite B: Autenticação (INT-02)', () => {

  test.describe('Sem estado autenticado (Clean State)', () => {
    // Override default authenticated storageState to start logged out
    test.use({ storageState: { cookies: [], origins: [] } });

    test('B1: Página de login carrega', async ({ page }) => {
      await navigateAndWait(page, '/login');
      await expect(page.locator('h1', { hasText: 'Bem-vindo de volta' })).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    });

    test('B3: Login com credenciais válidas', async ({ page }) => {
      await setupClerkTestingToken({ page });
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env variables must be set');
      }

      await navigateAndWait(page, '/login');
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForURL('/');
      await expect(page.locator('.user-dropdown-container')).toBeVisible();
    });

    test('B4: Login com credenciais inválidas mostra erro', async ({ page }) => {
      await setupClerkTestingToken({ page });
      await navigateAndWait(page, '/login');
      await page.locator('#email').fill('invalid@test.com');
      await page.locator('#password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Entrar' }).click();
      // Should show error message
      await expect(page.locator('.login-error')).toBeVisible();
    });

    test('B5: Redirecionamento de /admin sem auth', async ({ page }) => {
      await navigateAndWait(page, '/admin');
      // Should redirect to /login (via middleware or layout guard)
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Com estado autenticado do global setup', () => {
    test('B6: Logout limpa sessão', async ({ page }) => {
      // Starts already logged in using storageState from global.setup.ts
      await navigateAndWait(page, '/');

      // Logout via sidebar
      await page.locator('aside').getByRole('button', { name: 'Sair da Loja' }).click();
      await page.waitForTimeout(500);

      // Reload and verify login icon is shown
      await navigateAndWait(page, '/');
      // The user icon should be a link to /login
      const loginLink = page.locator('a[href="/login"]').first();
      await expect(loginLink).toBeVisible();
    });
  });
});

