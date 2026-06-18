import { test, expect } from './auth.fixture';
import {
  generateUniqueEmail, generateTestPassword,
} from './helpers';

const API_URL = 'http://localhost:3001/api/v1';
const PASSWORD = generateTestPassword();

test.describe('Suite J: Autorização (Endpoints)', () => {
  let customerToken = '';

  test.beforeAll(async ({ api }) => {
    const email = generateUniqueEmail();
    const auth = await api.register(email, PASSWORD);
    customerToken = auth.token;
  });

  test('J1: GET /products público (200)', async ({ request }) => {
    const res = await request.get(`${API_URL}/products`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('J2: POST /products sem token (401)', async ({ request }) => {
    const res = await request.post(`${API_URL}/products`, {
      headers: { 'Content-Type': 'application/json' },
      data: { name: 'test', price: 10, stock: 1 },
    });
    expect(res.status()).toBe(401);
  });

  test('J3: POST /products com token de cliente (403)', async ({ request }) => {
    const res = await request.post(`${API_URL}/products`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      data: { name: 'test', price: 10, stock: 1 },
    });
    expect(res.status()).toBe(403);
  });

  test('J4: GET /customers sem token (401)', async ({ request }) => {
    const res = await request.get(`${API_URL}/customers`);
    expect(res.status()).toBe(401);
  });

  test('J5: GET /orders sem token (401)', async ({ request }) => {
    const res = await request.get(`${API_URL}/orders`);
    expect(res.status()).toBe(401);
  });

  test('J6: GET /orders com token de cliente (200)', async ({ request }) => {
    const res = await request.get(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('J7: POST /categories sem token (401)', async ({ request }) => {
    const res = await request.post(`${API_URL}/categories`, {
      headers: { 'Content-Type': 'application/json' },
      data: { name: 'test' },
    });
    expect(res.status()).toBe(401);
  });

  test('J8: GET /categories público (200)', async ({ request }) => {
    const res = await request.get(`${API_URL}/categories`);
    expect(res.status()).toBe(200);
  });

  test('J9: PATCH /orders/:id/status sem token (401)', async ({ request }) => {
    const res = await request.patch(`${API_URL}/orders/1/status`, {
      headers: { 'Content-Type': 'application/json' },
      data: { status: 'Pago' },
    });
    expect(res.status()).toBe(401);
  });

  test('J10: DELETE /customers/:id sem token (401)', async ({ request }) => {
    const res = await request.delete(`${API_URL}/customers/0`);
    expect(res.status()).toBe(401);
  });
});
