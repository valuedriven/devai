/**
 * Central test fixture registry.
 *
 * ALWAYS import `test` and `expect` from this file — never directly from
 * `@playwright/test`. Importing directly bypasses all custom fixtures silently.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/baseTest';
 */

import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  getAuthToken,
  createCategory,
  deleteCategory,
  SeededCategory,
  createProduct,
  deleteProduct,
  SeededProduct,
  createCustomerApi,
  deleteCustomerApi,
  SeededCustomer,
} from '../utils/api';
import { makeProduct, makeCustomer } from '../utils/data';
import { LoginPage } from '../pages/LoginPage';
import { CategoryPage } from '../pages/CategoryPage';
import { ProductPage } from '../pages/ProductPage';
import { CustomerPage } from '../pages/CustomerPage';
import { OrderPage } from '../pages/OrderPage';
import { CartPage } from '../pages/CartPage';
import { StorefrontPage } from '../pages/StorefrontPage';
import { CustomerOrdersPage } from '../pages/CustomerOrdersPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NavigationComponent } from '../components/NavigationComponent';
import { ToastComponent } from '../components/ToastComponent';

type Fixtures = {
  /** Valid Clerk JWT extracted from the page context's devai_auth_token cookie. */
  authToken: string;
  /** Admin Clerk JWT extracted from the saved admin auth state. */
  adminAuthToken: string;
  /** A category created via API before the test and deleted in teardown. */
  seededCategory: SeededCategory;
  /** A product created via API before the test (depends on seededCategory) and deleted in teardown. */
  seededProduct: SeededProduct;
  /** A customer created via API before the test and deleted in teardown. */
  seededCustomer: SeededCustomer;
  loginPage: LoginPage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  customerPage: CustomerPage;
  orderPage: OrderPage;
  cartPage: CartPage;
  storefrontPage: StorefrontPage;
  customerOrdersPage: CustomerOrdersPage;
  checkoutPage: CheckoutPage;
  adminDashboardPage: AdminDashboardPage;
  forbiddenPage: ForbiddenPage;
  navigationComponent: NavigationComponent;
  toastComponent: ToastComponent;
};

export const test = base.extend<Fixtures>({
  authToken: async ({ page }, use) => {
    const token = await getAuthToken(page);
    await use(token);
  },

  adminAuthToken: async ({}, use) => {
    try {
      const adminStatePath = path.resolve(__dirname, '../.auth/admin.json');
      const stateContent = fs.readFileSync(adminStatePath, 'utf-8');
      const state = JSON.parse(stateContent) as { cookies: { name: string; value: string }[] };
      const token = state.cookies.find((c) => c.name === 'devai_auth_token')?.value;
      await use(token || '');
    } catch {
      await use('');
    }
  },

  seededCategory: async ({ request, adminAuthToken }, use) => {
    const category = await createCategory(request, adminAuthToken);
    await use(category);
    await deleteCategory(request, adminAuthToken, category.id);
  },

  seededProduct: async ({ request, adminAuthToken, seededCategory }, use) => {
    const product = await createProduct(request, adminAuthToken, makeProduct(seededCategory.id));
    await use(product);
    await deleteProduct(request, adminAuthToken, product.id);
  },

  seededCustomer: async ({ request, adminAuthToken }, use) => {
    const customer = await createCustomerApi(request, adminAuthToken, makeCustomer());
    await use(customer);
    await deleteCustomerApi(request, adminAuthToken, customer.id);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  customerPage: async ({ page }, use) => {
    await use(new CustomerPage(page));
  },
  orderPage: async ({ page }, use) => {
    await use(new OrderPage(page));
  },
  cartPage: async ({ page }, use) => {

    await use(new CartPage(page));
  },

  storefrontPage: async ({ page }, use) => {
    await use(new StorefrontPage(page));
  },

  customerOrdersPage: async ({ page }, use) => {
    await use(new CustomerOrdersPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },

  forbiddenPage: async ({ page }, use) => {
    await use(new ForbiddenPage(page));
  },

  navigationComponent: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },

  toastComponent: async ({ page }, use) => {
    await use(new ToastComponent(page));
  },
});

export { expect } from '@playwright/test';
