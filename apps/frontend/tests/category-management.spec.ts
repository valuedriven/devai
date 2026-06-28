// E2E tests for category management (change-04-category-management)
import { test, expect } from './fixtures/baseTest';
import { createCategory, SeededCategory } from './utils/api';
import { makeCategory } from './utils/data';

test.describe('Category Management', () => {

  test.beforeEach(async ({ categoryPage }) => {
    // Navigate to categories page
    await categoryPage.goto();
  });

  test('9.1 Admin can create a category successfully', async ({ categoryPage }) => {
    const catName = `Eletrônicos Teste ${Date.now()}`;
    
    await test.step('create category via UI', async () => {
      await categoryPage.createCategory(catName);
    });

    await test.step('verify category is visible in list', async () => {
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(catName)).toBeVisible();
    });
  });

  test('9.2 Admin can edit a category', async ({ request, authToken, categoryPage }) => {
    const editName = `Categoria Editada ${Date.now()}`;
    let category: SeededCategory;

    await test.step('seed category via API', async () => {
      category = await createCategory(request, authToken, makeCategory());
      await categoryPage.goto();
    });

    await test.step('edit category via UI', async () => {
      await categoryPage.editCategory(category.name, editName);
    });

    await test.step('verify updated category name in list', async () => {
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(editName)).toBeVisible();
    });
  });

  test('9.3 Admin can delete a category', async ({ request, authToken, categoryPage }) => {
    let category: SeededCategory;


    await test.step('seed category via API', async () => {
      category = await createCategory(request, authToken, makeCategory());
      await categoryPage.goto();
    });

    await test.step('delete category via UI', async () => {
      await categoryPage.deleteCategory(category.name);
    });

    await test.step('verify category is removed from list', async () => {
      await expect(categoryPage.dialog).toBeHidden({ timeout: 5000 });
      await expect(categoryPage.categoryTable.getByText(category.name)).toBeHidden();
    });
  });

  test('9.4 Non-admin user cannot access /admin/categories', async ({ page, loginPage, categoryPage }) => {
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

    await test.step('attempt to access admin categories page and verify 403', async () => {
      await categoryPage.goto();
      await expect(page.getByText(/403/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test('9.5 All category management tests pass', async ({ categoryPage }) => {
    const metaName = `Teste Completo ${Date.now()}`;
    const metaEditName = `Teste Editado ${Date.now()}`;

    await test.step('create category via UI', async () => {
      await categoryPage.createCategory(metaName);
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(metaName)).toBeVisible();
    });

    await test.step('edit category via UI', async () => {
      await categoryPage.editCategory(metaName, metaEditName);
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(metaEditName)).toBeVisible();
    });

    await test.step('delete category via UI', async () => {
      await categoryPage.deleteCategory(metaEditName);
      await expect(categoryPage.dialog).toBeHidden({ timeout: 5000 });
      await expect(categoryPage.categoryTable.getByText(metaEditName)).toBeHidden();
    });
  });

});