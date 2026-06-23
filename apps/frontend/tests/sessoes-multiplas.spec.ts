// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('11. Sessões Múltiplas', () => {

  test('11.1 Login em aba diferente', async ({ context }) => {
    // 1. Abrir duas abas com /login
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/login');
    await page2.goto('/login');

    // 2. Fazer login na primeira aba
    await page1.getByLabel('E-mail').fill(process.env.ADMIN_EMAIL!);
    await page1.getByLabel('Senha', { exact: true }).fill(process.env.ADMIN_PASSWORD!);
    await page1.getByRole('button', { name: 'Entrar' }).click();

    await page1.waitForURL('/');
    await expect(page1.getByTestId('user-dropdown-container')).toBeVisible();

    // 3. Recarregar a segunda aba
    await page2.reload();

    // Resultado esperado:
    // - Segunda aba também autenticada (cookie compartilhado)
    // Se a aba recarregar na raiz:
    await page2.goto('/');
    
    // - user-dropdown-container visível em ambas
    await expect(page2.getByTestId('user-dropdown-container')).toBeVisible();
  });

});
