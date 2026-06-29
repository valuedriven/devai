import { test, expect } from './fixtures/baseTest';
import { createProduct, createCustomerApi, createOrderApi } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('Order Management Lifecycle', () => {

  test('Scenario 2: Error Path - Reject Invalid Transition (Novo to Despachado)', async ({
    page,
    request,
    authToken,
    seededCategory
  }) => {
    // 1. Seed customer, product and order with initial status Novo
    const customer = await createCustomerApi(request, authToken, {
      name: 'Invalid Transition Test Customer',
      email: `invalid-transition-${Date.now()}@test.com`,
    });

    const product = await createProduct(request, authToken, {
      ...makeProduct(seededCategory.id),
      stock: 100
    });

    const order = await createOrderApi(request, authToken, {
      customerId: customer.id,
      totalAmount: 200,
      order_items: [{ productId: product.id, quantity: 1, unitPrice: 200 }]
    });
    const orderId = order.id;

    // 2. Make an API request as Admin attempting to patch the order status directly from Novo to Despachado
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001/api/v1';
    const response = await request.patch(`${API_BASE}/admin/orders/${orderId}/status`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: { status: 'Despachado' }
    });

    // 3. Assert: The server responds with 422 Unprocessable Entity
    expect(response.status()).toBe(422);

    // 4. Verify via UI that the order status remains Novo
    await page.goto(`/admin/orders/${orderId}`);
    await expect(page.getByText('Novo').first()).toBeVisible();
    await expect(page.getByText('Despachado').first()).toBeHidden();
  });

  test('Scenario 3: Happy Path - Order Cancellation', async ({
    page,
    request,
    authToken,
    seededCategory,
    orderPage
  }) => {
    // 1. Seed Customer and Product
    const customer = await createCustomerApi(request, authToken, {
      name: 'Cancellation Test Customer',
      email: `cancel-test-${Date.now()}@test.com`,
    });

    const product = await createProduct(request, authToken, {
      ...makeProduct(seededCategory.id),
      stock: 100
    });

    // Seed Order A (Novo)
    const orderA = await createOrderApi(request, authToken, {
      customerId: customer.id,
      totalAmount: 100,
      order_items: [{ productId: product.id, quantity: 1, unitPrice: 100 }]
    });

    // Seed Order B (Novo -> transitioned to Pago)
    const orderB = await createOrderApi(request, authToken, {
      customerId: customer.id,
      totalAmount: 100,
      order_items: [{ productId: product.id, quantity: 1, unitPrice: 100 }]
    });

    // 2. Navigate to Order A (Novo). Click Cancelar Pedido.
    await page.goto(`/admin/orders/${orderA.id}`);
    await expect(page.getByText('Novo').first()).toBeVisible();
    await orderPage.transitionStatus('Cancelar Pedido');
    
    // Assert: The status changes to Cancelado
    await expect(page.getByText('Cancelado').first()).toBeVisible();

    // 3. Navigate to Order B (Novo) and pay it first
    await page.goto(`/admin/orders/${orderB.id}`);
    await orderPage.openPaymentModal();
    await orderPage.fillPaymentForm('100', 'Pix');
    await expect(page.getByText('Pago').first()).toBeVisible();

    // Click Cancelar Pedido for Pago order
    await orderPage.transitionStatus('Cancelar Pedido');
    
    // Assert: The status changes to Cancelado
    await expect(page.getByText('Cancelado').first()).toBeVisible();
  });
});
