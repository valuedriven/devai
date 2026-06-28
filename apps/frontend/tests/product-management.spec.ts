// E2E tests for product management (change-05-product-management)
import { test, expect } from './fixtures/baseTest';
import { createProduct, SeededProduct } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('Product Management', () => {

  test('Admin can create a product successfully', async ({ page, seededCategory, productPage }) => {
    const prodName = `Produto Teste ${Date.now()}`;

    await test.step('navigate to products list', async () => {
      await productPage.goto();
      await expect(page.locator('h1', { hasText: 'Produtos' }).first()).toBeVisible();
    });

    await test.step('open new product form', async () => {
      await productPage.clickNewProduct();
      await expect(page.locator('h1', { hasText: 'Novo Produto' })).toBeVisible();
    });

    await test.step('fill product details', async () => {
      await productPage.fillProductDetails(
        prodName,
        '199.99',
        '10',
        'Descrição do produto de teste com Playwright',
        seededCategory.id
      );
    });

    await test.step('submit form and verify redirect', async () => {
      await productPage.submitForm();
      await page.waitForURL('**/admin/products', { timeout: 15000 });
      await expect(page.locator('h1', { hasText: 'Produtos' }).first()).toBeVisible();
      await expect(page.locator('table').getByText(prodName)).toBeVisible();
    });

  });

  test('Admin can edit a product', async ({ page, request, authToken, seededCategory, productPage }) => {
    const editName = `Produto Editado ${Date.now()}`;
    let product: SeededProduct;

    await test.step('seed product via API', async () => {
      product = await createProduct(request, authToken, makeProduct(seededCategory.id));
      await productPage.goto();
      await expect(page.locator('h1', { hasText: 'Produtos' }).first()).toBeVisible();
    });

    await test.step('edit product name and save', async () => {
      await productPage.editProduct(product.name, editName);
    });

    await test.step('verify update in list', async () => {
      await page.waitForURL('**/admin/products', { timeout: 15000 });
      await expect(page.locator('h1', { hasText: 'Produtos' }).first()).toBeVisible();
      await expect(page.locator('table').getByText(editName)).toBeVisible();
    });
  });

  test('Admin can delete a product', async ({ page, request, authToken, seededCategory, productPage }) => {
    let product: SeededProduct;

    await test.step('seed product via API', async () => {
      product = await createProduct(request, authToken, makeProduct(seededCategory.id));
      await productPage.goto();
      await expect(page.locator('h1', { hasText: 'Produtos' }).first()).toBeVisible();
    });

    await test.step('delete the product and confirm', async () => {
      await productPage.deleteProduct(product.name);
      await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
    });

    await test.step('verify product status is inactive in list', async () => {
      const row = page.locator('tr', { hasText: product.name });
      await expect(row.getByText('Inativo')).toBeVisible();
    });
  });

  test('Non-admin user cannot access /admin/products', async ({ page, loginPage, productPage }) => {
    await test.step('log out from admin session', async () => {
      await page.context().clearCookies();
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('log in as non-admin user', async () => {
      await loginPage.goto();
      await loginPage.login(
        process.env.CUSTOMER_EMAIL || 'jps012009@yahoo.com.br',
        process.env.CUSTOMER_PASSWORD || 'jps012009@yahoo.com.br'
      );
      await page.waitForURL('/');
    });

    await test.step('attempt to access admin products page and verify 403', async () => {
      await productPage.goto();
      await expect(page.getByText(/403/i)).toBeVisible({ timeout: 5000 });
    });
  });

});

