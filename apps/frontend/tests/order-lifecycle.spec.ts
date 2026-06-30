import { test, expect } from './fixtures/baseTest';
import { createProduct, createCustomerApi, createOrderApi } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('Order Lifecycle', () => {
  test.setTimeout(60_000);

  test('Admin can manage order lifecycle from New to Delivered', async ({
    request,
    authToken,
    seededCategory,
    orderPage
  }) => {
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
        await orderPage.goTo();
        await orderPage.searchOrder(orderNumber);
        await expect(orderPage.rowFor(orderNumber)).toBeVisible();
    });

    await test.step('view order details', async () => {
        await orderPage.goToOrderDetail(orderId);
        await expect(orderPage.heading.filter({ hasText: /Pedido #/i }).first()).toContainText(orderNumber);
        await expect(orderPage.statusBadge('Novo')).toBeVisible();
    });

    await test.step('register payment and verify Paid status', async () => {
        await orderPage.openPaymentModal();
        await orderPage.fillPaymentForm('150', 'Pix');
        
        // After payment, status should transition to Pago
        await expect(orderPage.statusBadge('Pago')).toBeVisible();
        await expect(orderPage.table).toContainText('Pix');
    });

    await test.step('transition to Preparation', async () => {
        await orderPage.transitionStatus('Iniciar Preparação');
        await expect(orderPage.statusBadge('Preparação')).toBeVisible();
    });

    await test.step('transition to Invoiced', async () => {
        await orderPage.transitionStatus('Emitir Nota Fiscal');
        await expect(orderPage.statusBadge('Faturado')).toBeVisible();
    });

    await test.step('transition to Shipped', async () => {
        await orderPage.transitionStatus('Despachar Pedido');
        await expect(orderPage.statusBadge('Despachado')).toBeVisible();
    });

    await test.step('transition to Delivered', async () => {
        await orderPage.transitionStatus('Confirmar Entrega');
        await expect(orderPage.statusBadge('Entregue')).toBeVisible();
    });

    await test.step('verify audit logs', async () => {
        await expect(
          orderPage.auditLog.getByTestId('audit-entry').filter({ hasText: 'Pago' }).filter({ hasText: 'Preparação' })
        ).toBeVisible();
        await expect(
          orderPage.auditLog.getByTestId('audit-entry').filter({ hasText: 'Despachado' }).filter({ hasText: 'Entregue' })
        ).toBeVisible();
    });
  });
});
