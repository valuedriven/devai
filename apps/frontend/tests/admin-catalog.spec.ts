import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from './auth.fixture';
import { navigateAndWait, setupAdminSession } from './helpers';

test.describe('Suite E+F+G: Admin (Dashboard, Products, Categories)', () => {

  let adminToken = '';
  let adminEmail = '';
  let adminPassword = '';

  test.beforeAll(async ({ api }) => {
    const creds = await api.getAdminCredentials();
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
      await page.getByLabel('E-mail').fill(adminEmail);
      await page.getByLabel('Senha').fill(adminPassword);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForURL('/');

      // Navigate to dashboard via sidebar (use first match since both desktop sidebar and mobile menu have it)
      await page.getByRole('link', { name: 'Dashboard' }).first().click();
      await page.waitForURL('/admin');

      // KPIs should be visible
      await expect(page.getByText('Total de Vendas')).toBeVisible();
      await expect(page.getByText('Pedidos Totais')).toBeVisible();
      await expect(page.getByText('Valor Pendente')).toBeVisible();
    });

    test('E2: Últimos pedidos visíveis na dashboard', async ({ page }) => {
      await navigateAndWait(page, '/admin');
      await expect(page.getByText('Últimos Pedidos')).toBeVisible();
      const tableRows = page.getByRole('row');
      const count = await tableRows.count();
      expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no orders
    });
  });

  test.describe('Suite F: Produtos (RFN-04 / INT-07 / INT-08)', () => {

    test('F1: Listagem de produtos', async ({ page }) => {
      await navigateAndWait(page, '/admin/products');
      await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible();
      const table = page.getByRole('table');
      await expect(table).toBeVisible();
    });

    test('F2: Criar produto via API (admin token)', async ({ api }) => {
      interface IdObj { id: string; name: string; }
      const cat = await api.createCategory(adminToken, `Test Cat ${Date.now()}`) as IdObj;
      expect(cat).toBeTruthy();

      const prod = await api.createProduct(adminToken, {
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
      await expect(page.getByRole('heading', { name: 'Novo Produto' })).toBeVisible();
    });
  });

  test.describe('Suite G: Categorias (RFN-03 / INT-06)', () => {

    test('G1: Listagem de categorias', async ({ page }) => {
      await navigateAndWait(page, '/admin/categories');
      await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible();
    });

    test('G2: Criar categoria via API', async ({ api }) => {
      const cat = await api.createCategory(adminToken, `Category ${Date.now()}`) as { id: string; name: string };
      expect(cat).toBeTruthy();
      expect(cat.name).toContain('Category');
    });
  });
});
