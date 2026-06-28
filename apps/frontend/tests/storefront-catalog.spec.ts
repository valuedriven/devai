// spec: openspec/changes/clean-products-module/specs/storefront-catalog/test-plan.md
import { test, expect } from './fixtures/baseTest';
import { makeCategory, makeProduct } from './utils/data';
import { createCategory, deleteCategory, createProduct, deleteProduct, SeededProduct } from './utils/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';


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

  test('1.3 Public single product retrieval returns HTTP 200 for active product', async ({ request, page, authToken, productPage }) => {
    const prodName = `Prod Pub ${Date.now()}`;

    // Create category via API
    const category = await createCategory(request, authToken, makeCategory());

    await test.step('create product via admin UI', async () => {
      await productPage.goto();
      await productPage.clickNewProduct();
      await expect(page.locator('h1', { hasText: 'Novo Produto' })).toBeVisible();

      await productPage.fillProductDetails(prodName, '99.99', '5', 'Produto E2E para teste de API pública', category.id);
      await productPage.submitForm();
      await page.waitForURL('**/admin/products', { timeout: 15000 });
    });

    await test.step('find created product via public API', async () => {
      // Fetch all public products and find the one we just created
      const listResponse = await request.get(`${API_BASE}/products`);
      expect(listResponse.status()).toBe(200);
      const products: { id: string; name: string; active: boolean }[] = await listResponse.json();
      const created = products.find((p) => p.name === prodName);
      expect(created, `Product "${prodName}" not found in public list`).toBeDefined();

      // Verify individual product endpoint
      const detailResponse = await request.get(`${API_BASE}/products/${created!.id}`);
      expect(detailResponse.status()).toBe(200);

      const product = await detailResponse.json();
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();
    });

    // Teardown category
    await deleteCategory(request, authToken, category.id);
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
    await storefrontPage.goto();

    await expect(storefrontPage.welcomeHeading).toBeVisible();
    await expect(storefrontPage.highlightsHeading).toBeVisible();
  });

  test('2.2 Product detail page shows product info when product exists', async ({ page, request, authToken, storefrontPage }) => {
    // Create category via API
    const category = await createCategory(request, authToken, makeCategory());
    let product: SeededProduct;

    try {
      await test.step('seed product via API', async () => {
        product = await createProduct(request, authToken, makeProduct(category.id));
      });

      await test.step('navigate to product detail page', async () => {
        await storefrontPage.gotoProductDetail(product.id);
      });

      await test.step('verify product info is visible', async () => {
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.getByText(/R\$/).first()).toBeVisible();
        await expect(storefrontPage.backToStoreLink).toBeVisible();
      });
    } finally {
      // Teardown
      await deleteProduct(request, authToken, product?.id);
      await deleteCategory(request, authToken, category.id);
    }
  });

  test('2.3 Non-existent product shows 404', async ({ page }) => {
    await page.goto('/products/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText(/404|not found|não encontrad/i)).toBeVisible({ timeout: 10000 });
  });

  test('2.4 Out-of-stock product displays "Esgotado" badge and disabled button', async ({ page, request, authToken }) => {
    const category = await createCategory(request, authToken, makeCategory());
    const prodData = makeProduct(category.id);
    prodData.stock = 0;
    const product = await createProduct(request, authToken, prodData);

    try {
      await page.goto('/');
      const card = page.locator('[data-testid="product-card"]', { hasText: product.name }).first();
      await expect(card.locator('.badge', { hasText: 'Esgotado' }).first()).toBeVisible();

      const button = card.locator('button', { hasText: 'Indisponível' }).first();
      await expect(button).toBeDisabled();
    } finally {
      await deleteProduct(request, authToken, product.id);
      await deleteCategory(request, authToken, category.id);
    }
  });

  test('2.5 Category filter navigation updates URL and filters products', async ({ page, request, authToken }) => {
    const catA = await createCategory(request, authToken, makeCategory());
    const catB = await createCategory(request, authToken, makeCategory());

    const prodA = await createProduct(request, authToken, { ...makeProduct(catA.id), name: `ProdA ${Date.now()}` });
    const prodB = await createProduct(request, authToken, { ...makeProduct(catB.id), name: `ProdB ${Date.now()}` });

    try {
      await page.goto('/');
      
      // Click on Category A link
      await page.locator(`a:has-text("${catA.name}")`).click();
      await page.waitForURL(new RegExp(`categoryId=${catA.id}`));

      // Verify only Prod A is visible
      await expect(page.locator('[data-testid="product-card"]', { hasText: prodA.name })).toBeVisible();
      await expect(page.locator('[data-testid="product-card"]', { hasText: prodB.name })).toBeHidden();
    } finally {
      await deleteProduct(request, authToken, prodA.id);
      await deleteProduct(request, authToken, prodB.id);
      await deleteCategory(request, authToken, catA.id);
      await deleteCategory(request, authToken, catB.id);
    }
  });

});

