import { test, expect } from './fixtures/baseTest';
import { makeCategory } from './utils/data';

test.describe('Category Management', () => {

  test.beforeEach(async ({ categoryPage }) => {
    // Navigate to categories page
    await categoryPage.goTo();
  });

  test('9.1 Admin can create a category successfully', async ({ categoryPage, faker }) => {
    const catName = makeCategory(faker).name;
    
    await test.step('create category via UI', async () => {
      await categoryPage.createCategory(catName);
    });

    await test.step('verify category is visible in list', async () => {
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(catName)).toBeVisible();
    });
  });

  test('9.2 Admin can edit a category', async ({ seededCategory, categoryPage, faker }) => {
    const editName = makeCategory(faker).name;

    await test.step('reload page to see seeded category', async () => {
      await categoryPage.goTo();
    });

    await test.step('edit category via UI', async () => {
      await categoryPage.editCategory(seededCategory.name, editName);
    });

    await test.step('verify updated category name in list', async () => {
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(editName)).toBeVisible();
    });
  });

  test('9.3 Admin can delete a category', async ({ seededCategory, categoryPage }) => {
    await test.step('reload page to see seeded category', async () => {
      await categoryPage.goTo();
    });

    await test.step('delete category via UI', async () => {
      await categoryPage.deleteCategory(seededCategory.name);
    });

    await test.step('verify category is removed from list', async () => {
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(seededCategory.name)).toBeHidden();
    });
  });

  test('9.4 Non-admin user cannot access /admin/categories', async ({ page, loginPage, storefrontPage, forbiddenPage }) => {
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
      await expect(storefrontPage.welcomeHeading).toBeVisible();
    });

    await test.step('attempt to access admin categories page and verify 403', async () => {
      await page.goto('/admin/categories');
      await expect(forbiddenPage.code).toBeVisible();
    });
  });

  test('9.5 All category management tests pass', async ({ categoryPage, faker }) => {
    const metaName = makeCategory(faker).name;
    const metaEditName = makeCategory(faker).name;

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
      await expect(categoryPage.dialog).toBeHidden();
      await expect(categoryPage.categoryTable.getByText(metaEditName)).toBeHidden();
    });
  });

});