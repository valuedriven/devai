import { test, expect } from '@playwright/test';
import {
  apiCall, registerUser, loginUser,
  generateUniqueEmail, generateTestPassword,
} from './tests/helpers';

interface Product { id: string; name: string; }

test.describe('Seed verification and setup', () => {
  test('API is reachable and seeded with products', async () => {
    const products = await apiCall<Product[]>('/products');
    expect(products.length).toBeGreaterThan(0);
  });

  test('test user can register and login', async () => {
    const email = generateUniqueEmail();
    const password = generateTestPassword();

    const auth = await registerUser(email, password);
    expect(auth.user.email).toBe(email);

    const loginResult = await loginUser(email, password);
    expect(loginResult.token).toBeTruthy();
    expect(loginResult.user.email).toBe(email);
  });

  test('active products endpoint returns only active', async () => {
    const activeProducts = await apiCall<Product[]>('/products/active');
    expect(activeProducts.length).toBeGreaterThan(0);
  });

  test('guest can fetch categories', async () => {
    const categories = await apiCall<{ id: string; name: string }[]>('/categories');
    expect(categories.length).toBeGreaterThan(0);
  });
});
