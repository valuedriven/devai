// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('5. Visibilidade Baseada em Papel (UI)', () => {

  test('5.1 Menu ADMIN visível para ADMIN', async ({ page }) => {
    // Autenticado como ADMIN por padrão
    
    // 1. Navegar para /
    await page.goto('/');

    // 2. Verificar sidebar
    const sidebar = page.locator('.sidebar-desktop');

    // Resultado esperado:
    // - Itens visíveis: Produtos, Categorias, Clientes, Pedidos, Dashboard
    await expect(sidebar.getByText('Administração')).toBeVisible();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Produtos')).toBeVisible();
    await expect(sidebar.getByText('Categorias')).toBeVisible();
    await expect(sidebar.getByText('Clientes')).toBeVisible();
    await expect(sidebar.getByText('Pedidos', { exact: true })).toBeVisible();
  });

  test('5.2 Menu ADMIN oculto para CUSTOMER', async ({ browser }) => {
    const context = await browser.newContext({ storageState: path.resolve(__dirname, '.auth/customer.json') });
    const page = await context.newPage();

    // 1. Navegar para /
    await page.goto('/');

    // 2. Verificar sidebar
    const sidebar = page.locator('.sidebar-desktop');

    // Resultado esperado:
    // - Itens CUSTOMER visíveis: Meus Pedidos
    await expect(sidebar.getByText('Meus pedidos')).toBeVisible();
    
    // - Itens ADMIN não visíveis
    await expect(sidebar.getByText('Administração')).toBeHidden();
    await expect(sidebar.getByText('Dashboard')).toBeHidden();
    await expect(sidebar.getByText('Categorias')).toBeHidden();

    await context.close();
  });

  test('5.3 Menu não autenticado', async ({ page }) => {
    await page.context().clearCookies();

    // 1. Navegar para /
    await page.goto('/');

    // 2. Verificar navegação (header) e sidebar
    const sidebar = page.locator('.sidebar-desktop');

    // Resultado esperado:
    // - Link para login visível (no header)
    await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible();
    
    // - Itens ADMIN ausentes
    await expect(sidebar.getByText('Administração')).toBeHidden();
    
    // - Itens CUSTOMER ausentes
    await expect(sidebar.getByText('Meus pedidos')).toBeHidden();
  });

});
