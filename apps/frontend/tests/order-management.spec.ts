import { test, expect } from './fixtures/baseTest';
import { API_BASE, createOrderApi } from './utils/api';
import { makeOrder, makeOrderItem } from './utils/data';

test.describe('Order Management Lifecycle', () => {

  test('Scenario 2: Error Path - Reject Invalid Transition (Novo to Despachado)', async ({
    request,
    authToken,
    seededOrder,
    orderPage
  }) => {
    const orderId = seededOrder.id;

    await test.step('attempt invalid status transition Novo → Despachado via API', async () => {
      const response = await request.patch(`${API_BASE}/admin/orders/${orderId}/status`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: { status: 'Despachado' }
      });

      expect(response.status()).toBe(422);
    });

    await test.step('verify via UI that order status remains Novo', async () => {
      await orderPage.goToOrderDetail(orderId);
      await expect(orderPage.statusBadge('Novo')).toBeVisible();
      await expect(orderPage.statusBadge('Despachado')).toBeHidden();
    });
  });

  test('Scenario 3: Happy Path - Order Cancellation', async ({
    request,
    authToken,
    seededCustomer,
    seededProduct,
    orderPage,
    faker
  }) => {
    let orderAId: string;
    let orderBId: string;

    await test.step('seed two orders via API', async () => {
      const orderA = await createOrderApi(
        request, 
        authToken, 
        makeOrder(seededCustomer.id, [makeOrderItem(seededProduct.id, 1, 100)]), 
        faker
      );
      orderAId = orderA.id;

      const orderB = await createOrderApi(
        request, 
        authToken, 
        makeOrder(seededCustomer.id, [makeOrderItem(seededProduct.id, 1, 100)]), 
        faker
      );
      orderBId = orderB.id;
    });

    await test.step('cancel Order A (Novo) and verify status changes to Cancelado', async () => {
      await orderPage.goToOrderDetail(orderAId);
      await expect(orderPage.statusBadge('Novo')).toBeVisible();
      await orderPage.transitionStatus('Cancelar Pedido');
      await expect(orderPage.statusBadge('Cancelado')).toBeVisible();
    });

    await test.step('pay Order B (Novo → Pago) then cancel it', async () => {
      await orderPage.goToOrderDetail(orderBId);
      await orderPage.openPaymentModal();
      await orderPage.fillPaymentForm('100', 'Pix');
      await expect(orderPage.statusBadge('Pago')).toBeVisible();

      await orderPage.transitionStatus('Cancelar Pedido');
      await expect(orderPage.statusBadge('Cancelado')).toBeVisible();
    });
  });
});
