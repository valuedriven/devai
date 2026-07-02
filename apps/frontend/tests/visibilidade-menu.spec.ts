// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';
import path from 'path';

test.describe('5. Visibilidade Baseada em Papel (UI)', () => {

  test.describe('Autenticado como ADMIN', () => {
    test.use({ storageState: path.resolve(__dirname, '.auth/admin.json') });

    test('5.1 Menu ADMIN visível para ADMIN', async ({ storefrontPage, navigationComponent }) => {
      await storefrontPage.goTo();

      const sidebar = navigationComponent.desktopSidebar;
      await expect(sidebar.getByText('Administração')).toBeVisible();
      await expect(sidebar.getByText('Dashboard')).toBeVisible();
      await expect(sidebar.getByText('Produtos')).toBeVisible();
      await expect(sidebar.getByText('Categorias')).toBeVisible();
      await expect(sidebar.getByText('Clientes')).toBeVisible();
      await expect(sidebar.getByText('Pedidos', { exact: true })).toBeVisible();
    });
  });

  test.describe('Autenticado como CUSTOMER', () => {
    test.use({ storageState: path.resolve(__dirname, '.auth/customer.json') });

    test('5.2 Menu ADMIN oculto para CUSTOMER', async ({ storefrontPage, navigationComponent }) => {
      await storefrontPage.goTo();

      const sidebar = navigationComponent.desktopSidebar;
      await expect(sidebar.getByText('Meus pedidos')).toBeVisible();

      await expect(sidebar.getByText('Administração')).toBeHidden();
      await expect(sidebar.getByText('Dashboard')).toBeHidden();
      await expect(sidebar.getByText('Categorias')).toBeHidden();
    });
  });

  test.describe('Não autenticado', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('5.3 Menu não autenticado', async ({ storefrontPage, navigationComponent }) => {
      await storefrontPage.goTo();

      const sidebar = navigationComponent.desktopSidebar;
      await expect(navigationComponent.loginLink).toBeVisible();

      await expect(sidebar.getByText('Administração')).toBeHidden();
      await expect(sidebar.getByText('Meus pedidos')).toBeHidden();
    });
  });

});
