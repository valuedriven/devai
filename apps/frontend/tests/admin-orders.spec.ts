import { test, expect } from './auth.fixture';
import { navigateAndWait, setupAdminSession } from './helpers';

test.describe('Suite H+I: Admin (Clientes, Pedidos)', () => {

  let adminToken = '';

  test.beforeAll(async ({ api }) => {
    const creds = await api.getAdminCredentials();
    adminToken = creds.token;
  });

  test.beforeEach(async ({ page }) => {
    if (adminToken) {
      await setupAdminSession(page, adminToken);
    }
  });

  test.describe('Suite H: Clientes (RFN-05 / INT-09 / INT-10)', () => {

    test('H1: Listagem de clientes', async ({ page }) => {
      await navigateAndWait(page, '/admin/customers');
      await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    });

    test('H2: Criar cliente via API', async ({ api }) => {
      const email = `test-customer-${Date.now()}@devai.com`;
      const customer = await api.post<{ id: string; email: string }>('/customers', {
        name: 'Test Customer',
        email,
        phone: '(11) 99999-9999',
        address: 'Rua Teste, 123',
        active: true,
      }, adminToken);
      expect(customer).toBeTruthy();
      expect(customer.email).toBe(email);
    });

    test('H3: Botão Novo Cliente navega para formulário', async ({ page }) => {
      await navigateAndWait(page, '/admin/customers');
      await page.getByRole('link', { name: 'Novo Cliente' }).click();
      await page.waitForURL('/admin/customers/new');
      await expect(page.getByRole('heading', { name: 'Novo Cliente' })).toBeVisible();
    });
  });

  test.describe('Suite I: Pedidos (RFN-06 / INT-11 / INT-05)', () => {

    test('I1: Listagem de pedidos', async ({ page }) => {
      await navigateAndWait(page, '/admin/orders');
      await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible();
    });

    test('I2: Detalhe do pedido (admin)', async ({ api, page }) => {
      // Get first order ID
      const orders = await api.get<{ id: string }[]>('/orders', adminToken);
      if (orders.length === 0) {
        test.skip(true, 'No orders in database');
        return;
      }
      const orderId = orders[0].id;
      await navigateAndWait(page, `/admin/orders/${orderId}`);
      // Should show order detail
      await expect(page.getByText(`#${orderId}`).first()).toBeVisible();
    });
  });
});