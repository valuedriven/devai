// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';

test.describe('9. Fluxo de Redirecionamento Pós-Login', () => {

  test('9.1 Redirecionamento para URL original após login (admin)', async ({ page, loginPage, storefrontPage, customerOrdersPage }) => {
    await test.step('clear authentication state', async () => {
      await page.context().clearCookies();
      await storefrontPage.goTo();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('navigate to protected route and verify redirect to /login', async () => {
      await customerOrdersPage.goTo();
      await expect(page).toHaveURL(/.*\/login\?redirect=.*orders/);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.emailInput).toBeEditable();
    });

    await test.step('log in as admin', async () => {
      await loginPage.login(
        process.env.ADMIN_EMAIL!,
        process.env.ADMIN_PASSWORD!
      );
      await page.waitForURL(/^(?!.*login).*\/orders$/, { timeout: 15_000 });
    });

    await test.step('verify redirect to original URL and page renders', async () => {
      await expect(page).toHaveURL(/^(?!.*login).*\/orders$/);
      await expect(customerOrdersPage.heading).toBeVisible();
    });
  });

  test('9.2 Redirecionamento para URL original após login (customer)', async ({ page, loginPage, storefrontPage, customerOrdersPage }) => {
    await test.step('clear authentication state', async () => {
      await page.context().clearCookies();
      await storefrontPage.goTo();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('navigate to protected route and verify redirect to /login', async () => {
      await customerOrdersPage.goTo();
      await expect(page).toHaveURL(/.*\/login\?redirect=.*orders/);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.emailInput).toBeEditable();
    });

    await test.step('log in as customer', async () => {
      await loginPage.login(
        process.env.CUSTOMER_EMAIL!,
        process.env.CUSTOMER_PASSWORD!
      );
      await page.waitForURL(/^(?!.*login).*\/orders$/, { timeout: 15_000 });
    });

    await test.step('verify redirect to original URL and page renders', async () => {
      await expect(page).toHaveURL(/^(?!.*login).*\/orders$/);
      await expect(customerOrdersPage.heading).toBeVisible();
    });
  });

});
