/* eslint-disable react-hooks/rules-of-hooks */
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
import {
  getAuthToken,
  createCategory,
  deleteCategory,
  SeededCategory,
} from '../utils/api';
import { LoginPage } from '../pages/LoginPage';
import { CategoryPage } from '../pages/CategoryPage';
import { ProductPage } from '../pages/ProductPage';
import { CustomerPage } from '../pages/CustomerPage';
import { OrderPage } from '../pages/OrderPage';
import { CartPage } from '../pages/CartPage';
import { StorefrontPage } from '../pages/StorefrontPage';
import { NavigationComponent } from '../components/NavigationComponent';

type Fixtures = {
  /** Valid Clerk JWT extracted from the page context's devai_auth_token cookie. */
  authToken: string;
  /** A category created via API before the test and deleted in teardown. */
  seededCategory: SeededCategory;
  loginPage: LoginPage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  customerPage: CustomerPage;
  orderPage: OrderPage;
  cartPage: CartPage;
  storefrontPage: StorefrontPage;
  navigationComponent: NavigationComponent;
};

export const test = base.extend<Fixtures>({
  authToken: async ({ page }, use) => {
    const token = await getAuthToken(page);
    await use(token);
  },

  seededCategory: async ({ request, authToken }, use) => {
    const category = await createCategory(request, authToken);
    await use(category);
    await deleteCategory(request, authToken, category.id);
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

  navigationComponent: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },
});

export { expect } from '@playwright/test';

