import { test, expect } from '@playwright/test';
import {
  registerUser, generateUniqueEmail, generateTestPassword,
} from './helpers';

const PASSWORD = generateTestPassword();

test.describe('Suite J: Autorização (Endpoints)', () => {

  let customerToken = '';

  test.beforeAll(async () => {
    const email = generateUniqueEmail();
    const auth = await registerUser(email, PASSWORD);
    customerToken = auth.token;
  });

  test('J1: GET /products público (200)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/products', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('J2: POST /products sem token (401)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test', price: 10, stock: 1 }),
    });
    expect(res.status).toBe(401);
  });

  test('J3: POST /products com token de cliente (403)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'test', price: 10, stock: 1 }),
    });
    expect(res.status).toBe(403);
  });

  test('J4: GET /customers sem token (401)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/customers');
    expect(res.status).toBe(401);
  });

  test('J5: GET /orders sem token (401)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/orders');
    expect(res.status).toBe(401);
  });

  test('J6: GET /orders com token de cliente (200)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/orders', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  test('J7: POST /categories sem token (401)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    });
    expect(res.status).toBe(401);
  });

  test('J8: GET /categories público (200)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/categories', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
  });

  test('J9: PATCH /orders/:id/status sem token (401)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/orders/1/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Pago' }),
    });
    expect(res.status).toBe(401);
  });

  test('J10: DELETE /customers/:id sem token (401)', async () => {
    const res = await fetch('http://localhost:3001/api/v1/customers/0', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(401);
  });
});
