import { APIRequestContext, Page } from '@playwright/test';
import { CategoryData, CustomerData, makeCategory, ProductData, OrderData } from './data';
import { faker as globalFaker } from '@faker-js/faker';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001/api/v1';

export const AUTH_COOKIE_NAME = 'devai_auth_token';

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function getAuthToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const token = cookies.find((c) => c.name === AUTH_COOKIE_NAME)?.value;
  if (!token) {
    throw new Error(`Cookie "${AUTH_COOKIE_NAME}" not found — did auth.setup.ts run?`);
  }
  return token;
}

function adminHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface SeededCategory {
  id: string;
  name: string;
}

export async function createCategory(
  request: APIRequestContext,
  token: string,
  data: CategoryData = makeCategory(),
): Promise<SeededCategory> {
  const res = await request.post(`${API_BASE}/admin/categories`, {
    headers: adminHeaders(token),
    data,
  });
  if (!res.ok()) {
    throw new Error(`createCategory failed: ${res.status()} ${await res.text()}`);
  }
  return res.json();
}

export async function deleteCategory(
  request: APIRequestContext,
  token: string,
  id?: string,
): Promise<void> {
  if (!id) return;
  // Best-effort teardown — don't fail the test if cleanup fails
  await request
    .delete(`${API_BASE}/admin/categories/${id}`, { headers: adminHeaders(token) })
    .catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface SeededProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  active: boolean;
  description?: string;
}

export async function createProduct(
  request: APIRequestContext,
  token: string,
  data: ProductData,
): Promise<SeededProduct> {
  const res = await request.post(`${API_BASE}/admin/products`, {
    headers: adminHeaders(token),
    data,
  });
  if (!res.ok()) {
    throw new Error(`createProduct failed: ${res.status()} ${await res.text()}`);
  }
  return res.json();
}

export async function deleteProduct(
  request: APIRequestContext,
  token: string,
  id?: string,
): Promise<void> {
  if (!id) return;
  // Best-effort teardown — don't fail the test if cleanup fails
  await request
    .delete(`${API_BASE}/admin/products/${id}`, { headers: adminHeaders(token) })
    .catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

export interface SeededCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
}

export async function createCustomerApi(
  request: APIRequestContext,
  token: string,
  data: CustomerData,
): Promise<SeededCustomer> {
  const res = await request.post(`${API_BASE}/customers`, {
    headers: adminHeaders(token),
    data,
  });
  if (!res.ok()) {
    throw new Error(`createCustomer failed: ${res.status()} ${await res.text()}`);
  }
  return res.json();
}

export async function deleteCustomerApi(
  request: APIRequestContext,
  token: string,
  id?: string,
): Promise<void> {
  if (!id) return;
  await request
    .delete(`${API_BASE}/customers/${id}`, { headers: adminHeaders(token) })
    .catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface SeededOrder {
  id: string;
  number: string;
  customerId: string;
  totalAmount: number;
  status: string;
}

export async function createOrderApi(
  request: APIRequestContext,
  token: string,
  data: OrderData,
  faker = globalFaker,
): Promise<SeededOrder> {
  const res = await request.post(`${API_BASE}/orders`, {
    headers: adminHeaders(token),
    data: {
      ...data,
      order_items: data.items,
      number: `E2E-${faker.string.numeric(10)}`,
    },
  });
  if (!res.ok()) {
    throw new Error(`createOrder failed: ${res.status()} ${await res.text()}`);
  }
  return res.json();
}
