// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';
import path from 'path';

test.describe('4. Rotas Protegidas', () => {

  test.describe('Acesso sem autenticação', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('4.1 Acesso a rota protegida sem autenticação', async ({ page, customerOrdersPage }) => {
      // Navegar diretamente para /orders
      await customerOrdersPage.goTo();

      // Redirecionar para /login com a URL original preservada
      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/redirect=.*orders/);
    });

    test('4.2 Acesso a rota admin sem autenticação', async ({ page, adminDashboardPage }) => {
      // Navegar diretamente para /admin
      await adminDashboardPage.goTo();

      // Redirecionar para /login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Acesso com papel CUSTOMER', () => {
    test.use({ storageState: path.resolve(__dirname, '.auth/customer.json') });

    test('4.3 Acesso a rota admin com papel CUSTOMER', async ({ page, forbiddenPage }) => {
      // Navegar para /admin/products
      await page.goto('/admin/products');

      // Página 403 Forbidden exibida
      await expect(forbiddenPage.code).toBeVisible();
      await expect(forbiddenPage.message).toBeVisible();
      await expect(page).toHaveURL(/\/403/);
    });

    test('4.5 Acesso a rota de pedidos autenticado', async ({ customerOrdersPage }) => {
      // Navegar para /orders
      await customerOrdersPage.goTo();

      // Página de pedidos renderizada
      await expect(customerOrdersPage.heading).toBeVisible();
    });
  });

  test.describe('Acesso com papel ADMIN', () => {
    test.use({ storageState: path.resolve(__dirname, '.auth/admin.json') });

    test('4.4 Acesso a rota admin com papel ADMIN', async ({ productPage, navigationComponent }) => {
      // Navegar para /admin/products
      await productPage.goTo();

      // Página admin renderizada normalmente
      await expect(productPage.heading.filter({ hasText: 'Produtos' })).toBeVisible();

      // Sidebar com opções ADMIN visíveis
      await expect(navigationComponent.desktopSidebar).toBeVisible();
    });
  });

});
