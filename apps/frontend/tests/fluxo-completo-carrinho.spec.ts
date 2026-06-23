// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('10. Regressão — Outros Fluxos', () => {

  test('10.1 Fluxo completo: adicionar ao carrinho → login → confirmar pedido', async ({ page }) => {
    // Estado inicial: Não autenticado
    await page.context().clearCookies();

    // 1. Navegar para /
    await page.goto('/');

    // 2. Clicar "Adicionar ao Carrinho" no primeiro produto
    // Finds the first 'Adicionar ao Carrinho' button
    await page.getByRole('button', { name: /Adicionar ao Carrinho/i }).first().click();

    // 3. Clicar no ícone do carrinho
    await page.getByTestId('cart-icon-wrapper').click();

    // 4. Verificar badge do carrinho com valor "1"
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    // 5. Clicar "Faça login para confirmar" ou botão similar para login
    // On the cart page when not logged in, we expect a link/button to login
    await page.getByRole('link', { name: /Faça login/i }).click();

    // 6. Preencher credenciais ADMIN
    await page.getByLabel('E-mail').fill(process.env.ADMIN_EMAIL!);
    await page.getByLabel('Senha', { exact: true }).fill(process.env.ADMIN_PASSWORD!);

    // 7. Clicar "Entrar"
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Aguardar redirect pós-login, como estávamos no cart, deve voltar para /cart ou se voltou para /, vamos para o cart novamente
    // If it redirected back to cart, great. If not, go to cart manually.
    await page.waitForURL('**/cart*');

    // 8. Verificar badge do carrinho com valor "1" (garante que persistiu após login)
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    // 9. Clicar "Confirmar Pedido"
    await page.getByRole('button', { name: /Confirmar Pedido/i }).click();

    // 10. Aguardar sucesso ou navegação para orders (dependendo de como o frontend age)
    await expect(page.getByRole('heading', { name: /Pedido/i })).toBeVisible();
  });

});
