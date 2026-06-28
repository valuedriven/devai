import { test, expect } from './fixtures/baseTest';
import { createProduct, createCustomerApi, createOrderApi } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('Order Lifecycle', () => {

  test('Admin can manage order lifecycle from New to Delivered', async ({ 
    page, 
    request, 
    authToken, 
    seededCategory, 
    orderPage 
  }) => {
    test.setTimeout(60000);
    let orderId: string;
    let orderNumber: string;

    await test.step('seed customer, product and order', async () => {
        const customer = await createCustomerApi(request, authToken, {
            name: 'Lifecycle Test',
            email: `lifecycle-${Date.now()}@test.com`,
        });

        const product = await createProduct(request, authToken, {
            ...makeProduct(seededCategory.id),
            stock: 100
        });

        const order = await createOrderApi(request, authToken, {
            customerId: customer.id,
            totalAmount: 150,
            order_items: [{ productId: product.id, quantity: 1, unitPrice: 150 }]
        });
        orderId = order.id;
        orderNumber = order.number;
    });

    await test.step('navigate to order list and find order', async () => {
        await orderPage.goto();
        await page.getByPlaceholder(/Pesquisar/i).fill(orderNumber);
        await page.keyboard.press('Enter');
        await expect(page.locator('tr', { hasText: orderNumber })).toBeVisible();
    });

    await test.step('view order details', async () => {
        await page.goto(`/admin/orders/${orderId}`);
        await expect(page.getByRole('heading', { name: /Pedido #/i }).first()).toContainText(orderNumber);
        await expect(page.getByText('Novo').first()).toBeVisible();
    });

    await test.step('register payment and verify Paid status', async () => {
        await orderPage.openPaymentModal();
        await orderPage.fillPaymentForm('150', 'Pix');
        
        // After payment, status should transition to Pago
        await expect(page.getByText('Pago').first()).toBeVisible();
        await expect(page.locator('table')).toContainText('Pix');
    });

    await test.step('transition to Preparation', async () => {
        await orderPage.transitionStatus('Iniciar Preparação');
        await expect(page.getByText('Preparação').first()).toBeVisible();
    });

    await test.step('transition to Invoiced', async () => {
        await orderPage.transitionStatus('Emitir Nota Fiscal');
        await expect(page.getByText('Faturado').first()).toBeVisible();
    });

    await test.step('transition to Shipped', async () => {
        await orderPage.transitionStatus('Despachar Pedido');
        await expect(page.getByText('Despachado').first()).toBeVisible();
    });

    await test.step('transition to Delivered', async () => {
        await orderPage.transitionStatus('Confirmar Entrega');
        await expect(page.getByText('Entregue').first()).toBeVisible();
    });

    await test.step('verify audit logs', async () => {
        await expect(page.locator('div', { hasText: 'De Pago para Preparação' })).toBeVisible();
        await expect(page.locator('div', { hasText: 'De Despachado para Entregue' })).toBeVisible();
    });
  });
});
