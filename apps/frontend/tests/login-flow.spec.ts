// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';

test.describe('1. Fluxo de Login', () => {

  test.beforeEach(async ({ page, storefrontPage }) => {
    // Clear cookies and local storage before each test
    await page.context().clearCookies();
    await storefrontPage.goTo();
    await page.evaluate(() => localStorage.clear());
  });

  test('1.1 Login com credenciais válidas (ADMIN)', async ({ page, loginPage, navigationComponent }) => {
    await test.step('navigate to login page', async () => {
      await loginPage.goTo();
    });

    await test.step('fill credentials and submit', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    });

    await test.step('verify success redirect and dropdown container visibility', async () => {
      await expect(page).toHaveURL('/');
      await expect(navigationComponent.userDropdownContainer).toBeVisible();
      await expect(loginPage.loginError).toBeHidden();
    });
  });

  test('1.2 Login com credenciais válidas (CUSTOMER)', async ({ page, loginPage, navigationComponent }) => {
    await page.context().clearCookies();

    await test.step('navigate to login page', async () => {
      await loginPage.goTo();
    });

    await test.step('fill customer credentials and submit', async () => {
      await loginPage.login(process.env.CUSTOMER_EMAIL!, process.env.CUSTOMER_PASSWORD!);
    });

    await test.step('verify customer elements in navigation sidebar', async () => {
      await expect(page).toHaveURL('/');
      await expect(navigationComponent.desktopSidebar.getByText(/meus pedidos/i)).toBeVisible();
      await expect(navigationComponent.desktopSidebar.getByText(/administração/i)).toBeHidden();
      await expect(navigationComponent.desktopSidebar.getByText(/dashboard/i)).toBeHidden();
    });
  });

  test('1.3 Login com e-mail inválido', async ({ page, loginPage }) => {
    await page.context().clearCookies();

    await test.step('navigate to login page', async () => {
      await loginPage.goTo();
    });

    await test.step('login with non-existent email', async () => {
      await loginPage.login('inexistente@email.com', 'qualquer123');
    });

    await test.step('verify login error', async () => {
      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.loginError).toBeVisible();
      await expect(loginPage.loginError).toContainText(/falha|inválido|invalid/i);
    });
  });

  test('1.4 Login com senha incorreta', async ({ page, loginPage }) => {
    await page.context().clearCookies();

    await test.step('navigate to login page', async () => {
      await loginPage.goTo();
    });

    await test.step('login with wrong password', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, 'senha_errada_123');
    });

    await test.step('verify login error', async () => {
      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.loginError).toBeVisible();
    });
  });

  test('1.5 Login com campos vazios', async ({ page, loginPage }) => {
    await page.context().clearCookies();

    await test.step('navigate to login page', async () => {
      await loginPage.goTo();
    });

    await test.step('click submit without filling fields', async () => {
      await loginPage.submitButton.click();
    });

    await test.step('verify HTML5 validation prevents submission', async () => {
      const isEmailInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isEmailInvalid).toBeTruthy();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test('1.6 Login com e-mail mal formatado', async ({ page, loginPage }) => {
    await page.context().clearCookies();

    await test.step('navigate to login page', async () => {
      await loginPage.goTo();
    });

    await test.step('login with malformed email', async () => {
      await loginPage.login('email-invalido', 'qualquer123');
    });

    await test.step('verify HTML5 validation prevents submission', async () => {
      const isEmailInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isEmailInvalid).toBeTruthy();
      await expect(page).toHaveURL(/\/login/);
    });
  });

});

