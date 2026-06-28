// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';

test.describe('3. Fluxo de Logout', () => {

  test('3.1 Logout bem-sucedido', async ({ page, navigationComponent }) => {
    await test.step('navigate to homepage', async () => {
      await page.goto('/');
    });

    await test.step('perform logout', async () => {
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/auth/logout') && response.status() === 204
      );
      await navigationComponent.logout();
      await responsePromise;
    });

    await test.step('reload page to verify session cleanup', async () => {
      await page.reload();
    });

    await test.step('verify logged out state in UI and cookies', async () => {
      await expect(navigationComponent.loginLink.first()).toBeVisible();
      await expect(navigationComponent.userDropdownContainer).toBeHidden();

      const cookies = await page.context().cookies();
      const authCookie = cookies.find(c => c.name === 'devai_auth_token');
      expect(!authCookie || authCookie.value === '').toBeTruthy();
    });
  });

  test('3.2 Logout sem sessão ativa', async ({ page, navigationComponent }) => {
    await test.step('clear authentication session and reload', async () => {
      await page.context().clearCookies();
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('verify logout button is hidden and login link is visible', async () => {
      await expect(navigationComponent.logoutButton).toBeHidden();
      await expect(navigationComponent.loginLink.first()).toBeVisible();
    });
  });

});

