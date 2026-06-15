import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';
import { navigateAndWait, setupAdminSession, createTestCategory, createTestProduct, getAdminCredentials } from './helpers';

test.describe('Suite E+F+G: Admin (Dashboard, Products, Categories)', () => {

  let adminToken = '';
  let adminEmail = '';
  let adminPassword = '';

  test.beforeAll(async () => {
    const creds = await getAdminCredentials();
    adminEmail = creds.email;
    adminPassword = creds.password;
    adminToken = creds.token;
    expect(adminToken).toBeTruthy();
  });

  test.beforeEach(async ({ page }) => {
    if (adminToken) {
      await setupAdminSession(page, adminToken);
    }
  });

  test.describe('Suite E: Dashboard (RFN-07 / INT-12)', () => {

    test('E1: Dashboard carrega com KPIs', async ({ page }) => {
      // Login as admin via UI first to set session
      await setupClerkTestingToken({ page });
      await navigateAndWait(page, '/login');
      await page.locator('#email').fill(adminEmail);
      await page.locator('#password').fill(adminPassword);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForURL('/');

      // Navigate to dashboard via sidebar
      await page.locator('aside a[href="/admin"]').click();
      await page.waitForURL('/admin');

      // KPIs should be visible
      await expect(page.locator('text=Total de Vendas')).toBeVisible();
      await expect(page.locator('text=Pedidos Totais')).toBeVisible();
      await expect(page.locator('text=Valor Pendente')).toBeVisible();
    });

    test('E2: Últimos pedidos visíveis na dashboard', async ({ page }) => {
      await navigateAndWait(page, '/admin');
      await expect(page.locator('text=Últimos Pedidos')).toBeVisible();
      const tableRows = page.locator('table tbody tr');
      const count = await tableRows.count();
      expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no orders
    });
  });

  test.describe('Suite F: Produtos (RFN-04 / INT-07 / INT-08)', () => {

    test('F1: Listagem de produtos', async ({ page }) => {
      await navigateAndWait(page, '/admin/products');
      await expect(page.locator('h1', { hasText: 'Produtos' })).toBeVisible();
      const table = page.locator('table');
      await expect(table).toBeVisible();
    });

    test('F2: Criar produto via API (admin token)', async () => {
      interface IdObj { id: string; name: string; }
      const cat = await createTestCategory(adminToken, `Test Cat ${Date.now()}`) as IdObj;
      expect(cat).toBeTruthy();

      const prod = await createTestProduct(adminToken, {
        name: `Test Product ${Date.now()}`,
        description: 'Test description',
        price: 99.90,
        stock: 10,
        category_id: cat.id,
        active: true,
      }) as IdObj;
      expect(prod).toBeTruthy();
      expect(prod.name).toContain('Test Product');
    });

    test('F3: Botão Novo Produto navega para formulário', async ({ page }) => {
      await navigateAndWait(page, '/admin/products');
      await page.getByRole('link', { name: 'Novo Produto' }).click();
      await page.waitForURL('/admin/products/new');
      await expect(page.locator('h1', { hasText: 'Novo Produto' })).toBeVisible();
    });
  });

  test.describe('Suite G: Categorias (RFN-03 / INT-06)', () => {

    test('G1: Listagem de categorias', async ({ page }) => {
      await navigateAndWait(page, '/admin/categories');
      await expect(page.locator('h1', { hasText: 'Categorias' })).toBeVisible();
    });

    test('G2: Criar categoria via API', async () => {
      const cat = await createTestCategory(adminToken, `Category ${Date.now()}`) as { id: string; name: string };
      expect(cat).toBeTruthy();
      expect(cat.name).toContain('Category');
    });
  });
});
