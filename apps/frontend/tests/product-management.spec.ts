// E2E tests for product management (change-05-product-management)
import { test, expect } from './fixtures/baseTest';
import { createProduct, SeededProduct } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('Product Management', () => {

  test('Admin can create a product successfully', async ({ page, seededCategory, productPage, faker }) => {
    const prod = makeProduct(seededCategory.id, undefined, faker);
    const prodName = prod.name;

    await test.step('navigate to products list', async () => {
      await productPage.goTo();
      await expect(productPage.heading.filter({ hasText: 'Produtos' })).toBeVisible();
    });

    await test.step('open new product form', async () => {
      await productPage.clickNewProduct();
      await expect(productPage.heading.filter({ hasText: 'Novo Produto' })).toBeVisible();
    });

    await test.step('fill product details', async () => {
      await productPage.fillProductDetails(
        prodName,
        prod.price.toString(),
        prod.stock.toString(),
        prod.description || 'Descrição do produto',
        seededCategory.id
      );
    });

    await test.step('submit form and verify redirect', async () => {
      await productPage.submitForm();
      await page.waitForURL('**/admin/products', { timeout: 15000 });
      await expect(productPage.heading.filter({ hasText: 'Produtos' })).toBeVisible();
      await expect(productPage.table.getByText(prodName)).toBeVisible();
    });

  });

  test('Admin can edit a product', async ({ page, request, authToken, seededCategory, productPage, faker }) => {
    const editName = makeProduct(seededCategory.id, undefined, faker).name;
    let product: SeededProduct;

    await test.step('seed product via API', async () => {
      product = await createProduct(request, authToken, makeProduct(seededCategory.id, undefined, faker));
      await productPage.goTo();
      await expect(productPage.heading.filter({ hasText: 'Produtos' })).toBeVisible();
    });

    await test.step('edit product name and save', async () => {
      await productPage.editProduct(product.name, editName);
    });

    await test.step('verify update in list', async () => {
      await page.waitForURL('**/admin/products', { timeout: 15000 });
      await expect(productPage.heading.filter({ hasText: 'Produtos' })).toBeVisible();
      await expect(productPage.table.getByText(editName)).toBeVisible();
    });
  });

  test('Admin can delete a product', async ({ request, authToken, seededCategory, productPage, faker }) => {
    let product: SeededProduct;

    await test.step('seed product via API', async () => {
      product = await createProduct(request, authToken, makeProduct(seededCategory.id, undefined, faker));
      await productPage.goTo();
      await expect(productPage.heading.filter({ hasText: 'Produtos' })).toBeVisible();
    });

    await test.step('delete the product and confirm', async () => {
      await productPage.deleteProduct(product.name);
      await expect(productPage.dialog).toBeHidden();
    });

    await test.step('verify product status is inactive in list', async () => {
      const row = productPage.rowFor(product.name);
      await expect(row.getByText('Inativo')).toBeVisible();
    });
  });

  test('Non-admin user cannot access /admin/products', async ({ page, loginPage, storefrontPage, forbiddenPage }) => {
    await test.step('log out from admin session', async () => {
      await page.context().clearCookies();
      await storefrontPage.goTo();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('log in as non-admin user', async () => {
      await loginPage.goTo();
      await loginPage.login(
        process.env.CUSTOMER_EMAIL!,
        process.env.CUSTOMER_PASSWORD!
      );
      await page.waitForURL('/');
    });

    await test.step('attempt to access admin products page and verify 403', async () => {
      await page.goto('/admin/products');
      await expect(forbiddenPage.code).toBeVisible();
    });
  });

});

