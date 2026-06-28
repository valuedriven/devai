// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';
import path from 'path';

test.describe('4. Rotas Protegidas', () => {

  test('4.1 Acesso a rota protegida sem autenticação', async ({ page }) => {
    await page.context().clearCookies();

    // 1. Navegar diretamente para /orders
    await page.goto('/orders');

    // Resultado esperado:
    // - Redirecionar para /login
    await expect(page).toHaveURL(/\/login/);
    
    // - URL original preservada para redirect pós-login
    await expect(page).toHaveURL(/redirect=.*orders/);
  });

  test('4.2 Acesso a rota admin sem autenticação', async ({ page }) => {
    await page.context().clearCookies();

    // 1. Navegar diretamente para /admin
    await page.goto('/admin');

    // Resultado esperado:
    // - Redirecionar para /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('4.3 Acesso a rota admin com papel CUSTOMER', async ({ browser }) => {
    // Usa a sessão de customer gerada no auth.setup.ts
    const context = await browser.newContext({ storageState: path.resolve(__dirname, '.auth/customer.json') });
    const page = await context.newPage();

    // 2. Navegar para /admin/products
    await page.goto('/admin/products');

    // Resultado esperado:
    // - Página 403 Forbidden exibida
    await expect(page.getByText('403')).toBeVisible();
    await expect(page.getByText('Acesso Negado')).toBeVisible();
    
    // - Não redireciona para login, mas para /403
    await expect(page).toHaveURL(/\/403/);
    
    await context.close();
  });

  test('4.4 Acesso a rota admin com papel ADMIN', async ({ page }) => {
    // Usa sessão de ADMIN padrão
    
    // 1. Navegar para /admin/products
    await page.goto('/admin/products');

    // Resultado esperado:
    // - Página admin renderizada normalmente
    await expect(page.getByRole('heading', { name: /Produtos/i, level: 1 })).toBeVisible();
    
    // - Sidebar com opções ADMIN visíveis
    const sidebar = page.locator('aside').first(); // admin layout
    await expect(sidebar).toBeVisible();
  });

  test('4.5 Acesso a rota de pedidos autenticado', async ({ browser }) => {
    // Usa sessão CUSTOMER
    const context = await browser.newContext({ storageState: path.resolve(__dirname, '.auth/customer.json') });
    const page = await context.newPage();

    // 2. Navegar para /orders
    await page.goto('/orders');

    // Resultado esperado:
    // - Página de pedidos renderizada
    await expect(page.getByRole('heading', { name: /Meus Pedidos/i })).toBeVisible();

    await context.close();
  });

});
