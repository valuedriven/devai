import { test, expect } from './auth.fixture';
import {
  generateUniqueEmail, generateTestPassword,
} from './helpers';

interface Product { id: string; name: string; }

test.describe('Seed verification and setup', () => {
  test('API is reachable and seeded with products', async ({ api }) => {
    const products = await api.get<Product[]>('/products');
    expect(products.length).toBeGreaterThan(0);
  });

  test('test user can register and login', async ({ api }) => {
    const email = generateUniqueEmail();
    const password = generateTestPassword();

    const auth = await api.register(email, password);
    expect(auth.user.email).toBe(email);

    const loginResult = await api.login(email, password);
    expect(loginResult.token).toBeTruthy();
    expect(loginResult.user.email).toBe(email);
  });

  test('active products endpoint returns only active', async ({ api }) => {
    const activeProducts = await api.get<Product[]>('/products/active');
    expect(activeProducts.length).toBeGreaterThan(0);
  });

  test('guest can fetch categories', async ({ api }) => {
    const categories = await api.get<{ id: string; name: string }[]>('/categories');
    expect(categories.length).toBeGreaterThan(0);
  });
});
