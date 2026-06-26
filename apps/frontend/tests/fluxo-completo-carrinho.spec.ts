// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('10. Regressão — Outros Fluxos', () => {

  test.fixme('10.1 Fluxo completo: adicionar ao carrinho → login → confirmar pedido', async ({ page }) => {
    // FIXME: The database might not be seeded with products which causes the locator for 'Adicionar ao Carrinho' to timeout.
    // Estado inicial: Não autenticado
    await page.context().clearCookies();

    // 1. Navegar para /
    await page.goto('/');
    // Limpar o localStorage que veio do storageState do playwright
    await page.evaluate(() => localStorage.clear());
    // Recarregar a página para aplicar a limpeza
    await page.reload();

    // 2. Clicar "Adicionar ao Carrinho" no primeiro produto
    // Finds the first 'Adicionar ao Carrinho' button
    await page.getByRole('button', { name: /Adicionar ao Carrinho/i }).first().click();

    // 3. Clicar no ícone do carrinho
    await page.getByTestId('cart-icon-wrapper').first().click();

    // 4. Verificar badge do carrinho com valor "1"
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    // 5. Clicar "Faça login para confirmar" ou botão similar para login
    // On the cart page when not logged in, we expect a link/button to login
    await page.getByRole('button', { name: /Faça login/i }).click();

    // 6. Preencher credenciais ADMIN
    await page.getByLabel(/e-?mail/i).fill(process.env.ADMIN_EMAIL!);
    await page.getByLabel(/senha/i).fill(process.env.ADMIN_PASSWORD!);

    // 7. Clicar "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Aguardar o redirecionamento pós-login (vai voltar para /cart por causa da query string)
    await page.waitForURL(/\/cart/);
    
    // 8. Verificar badge do carrinho com valor "1" (garante que persistiu após login)
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    // 9. Clicar "Confirmar Pedido"
    await page.getByRole('button', { name: /Confirmar Pedido/i }).click();

    // 10. Aguardar sucesso ou navegação para orders (dependendo de como o frontend age)
    await expect(page.getByRole('heading', { name: /Pedido/i })).toBeVisible();
  });

});
