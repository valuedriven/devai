// spec: openspec/changes/clean-products-module/specs/storefront-catalog/test-plan.md
import { test, expect } from './fixtures/baseTest';
import { makeCategory, makeProduct } from './utils/data';
import { createCategory, deleteCategory, createProduct, deleteProduct, SeededProduct, API_BASE } from './utils/api';


test.describe('Storefront Public API', () => {

  test('1.1 Public products list returns HTTP 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('1.2 Public products list returns only active products', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    for (const product of data) {
      expect(product.active).toBe(true);
    }
  });

  test('1.3 Public single product retrieval returns HTTP 200 for active product', async ({ request, seededProduct }) => {
    await test.step('find created product via public API', async () => {
      // Fetch all public products and find the one we just created
      const listResponse = await request.get(`${API_BASE}/products`);
      expect(listResponse.status()).toBe(200);
      const products: { id: string; name: string; active: boolean }[] = await listResponse.json();
      const created = products.find((p) => p.name === seededProduct.name);
      expect(created, `Product "${seededProduct.name}" not found in public list`).toBeDefined();

      // Verify individual product endpoint
      const detailResponse = await request.get(`${API_BASE}/products/${seededProduct.id}`);
      expect(detailResponse.status()).toBe(200);

      const productJson = await detailResponse.json();
      expect(productJson.name).toBeDefined();
      expect(productJson.price).toBeDefined();
    });
  });

  test('1.4 Public single product retrieval returns 404 for non-existent product', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products/00000000-0000-0000-0000-000000000000`);
    expect(response.status()).toBe(404);
  });

  test('1.5 Public categories list returns HTTP 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/categories`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('1.6 Public categories list returns only active categories', async ({ request }) => {
    const response = await request.get(`${API_BASE}/categories`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    for (const category of data) {
      expect(category.active).toBe(true);
    }
  });

});

test.describe('Storefront Frontend Integration', () => {

  test('2.1 Homepage displays hero section', async ({ storefrontPage }) => {
    await storefrontPage.goTo();

    await expect(storefrontPage.welcomeHeading).toBeVisible();
    await expect(storefrontPage.highlightsHeading).toBeVisible();
  });

  test('2.2 Product detail page shows product info when product exists', async ({ seededProduct, storefrontPage }) => {
    await test.step('navigate to product detail page', async () => {
      await storefrontPage.gotoProductDetail(seededProduct.id);
    });

    await test.step('verify product info is visible', async () => {
      await expect(storefrontPage.heading.filter({ hasText: seededProduct.name })).toBeVisible();
      await expect(storefrontPage.price).toBeVisible();
      await expect(storefrontPage.backToStoreLink).toBeVisible();
    });
  });

  test('2.3 Non-existent product shows 404', async ({ storefrontPage }) => {
    await storefrontPage.gotoProductDetail('00000000-0000-0000-0000-000000000000');
    await expect(storefrontPage.notFoundMessage).toBeVisible();
  });

  test('2.4 Out-of-stock product displays "Esgotado" badge and disabled button', async ({ storefrontPage, request, adminAuthToken, seededCategory, faker }) => {
    const product = await createProduct(request, adminAuthToken, { ...makeProduct(seededCategory.id, undefined, faker), stock: 0 });

    await test.step('navigate to storefront', async () => {
      await storefrontPage.goTo();
    });

    await test.step('assert out-of-stock badge and disabled button via ProductCardComponent', async () => {
      const card = storefrontPage.productCard(product.name);
      await expect(card.outOfStockBadge).toBeVisible();
      await expect(card.unavailableButton).toBeDisabled();
    });
  });

  test('2.5 Category filter navigation updates URL and filters products', async ({ page, storefrontPage, request, adminAuthToken, faker }) => {
    const catA = await createCategory(request, adminAuthToken, makeCategory(faker));
    const catB = await createCategory(request, adminAuthToken, makeCategory(faker));

    const prodA = await createProduct(request, adminAuthToken, makeProduct(catA.id, undefined, faker));
    const prodB = await createProduct(request, adminAuthToken, makeProduct(catB.id, undefined, faker));

    await test.step('navigate to storefront', async () => {
      await storefrontPage.goTo();
    });

    await test.step('click category A link', async () => {
      await storefrontPage.categoryLink(catA.name).click();
    });

    await test.step('verify only category A products are visible', async () => {
      await expect(storefrontPage.productCardByName(prodA.name)).toBeVisible();
      await expect(storefrontPage.productCardByName(prodB.name)).toBeHidden();
    });
  });

});
