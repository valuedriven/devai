// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('11. Sessões Múltiplas', () => {

  test('11.1 Login em aba diferente', async ({ context }) => {
    // 1. Abrir duas abas com /login
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Clear cookies explicitly because playwright uses storageState by default
    await context.clearCookies();

    await page1.goto('/login');
    await page2.goto('/login');

    // 2. Fazer login na primeira aba
    await page1.getByLabel(/e-?mail/i).fill(process.env.ADMIN_EMAIL!);
    await page1.getByLabel(/senha/i).fill(process.env.ADMIN_PASSWORD!);
    await page1.getByRole('button', { name: /entrar/i }).click();

    await page1.waitForURL('/');
    await expect(page1.getByTestId('user-dropdown-container')).toBeVisible();

    // 3. Acessar a aplicação na segunda aba
    await page2.goto('/');
    
    // - user-dropdown-container visível em ambas
    await expect(page2.getByTestId('user-dropdown-container')).toBeVisible();
  });

});
