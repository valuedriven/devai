// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('3. Fluxo de Logout', () => {

  test('3.1 Logout bem-sucedido', async ({ page }) => {
    // Estado inicial: Autenticado (usa o storageState default de admin)
    
    // 1. Navegar para /
    await page.goto('/');

    // 2. Clicar no botão "Sair da Loja" no sidebar
    await page.getByRole('button', { name: /Sair da Loja/i }).click();

    // 3. Aguardar navegação/atualização
    await page.waitForURL('/');

    // 4. Recarregar a página para garantir que sessão foi encerrada
    await page.reload();

    // Resultado esperado:
    // - Sessão encerrada
    // - Link de login visível na navegação
    await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible();
    
    // - user-dropdown-container não visível
    await expect(page.getByTestId('user-dropdown-container')).not.toBeVisible();

    // Verifica cookie (não deve existir ou deve estar vazio)
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'devai_auth_token');
    expect(!authCookie || authCookie.value === '').toBeTruthy();
  });

  test('3.2 Logout sem sessão ativa', async ({ page }) => {
    // Estado inicial: Não autenticado
    await page.context().clearCookies();

    // 1. Navegar para /
    await page.goto('/');

    // 2. Verificar que botão de logout não está visível
    await expect(page.getByRole('button', { name: /Sair da Loja/i })).not.toBeVisible();

    // - Link para /login visível
    await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible();
  });

});
