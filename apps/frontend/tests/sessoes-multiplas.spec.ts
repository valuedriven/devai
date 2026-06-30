// spec: openspec/changes/change-03-auth-security/test-plan.md
// Direct POM construction is necessary here because we need two browser pages (tabs)
// within the same context for multi-session testing. The fixture pattern only provides
// a single `page`, so we bypass it for this multi-page scenario.
import { test, expect } from './fixtures/baseTest';
import { LoginPage } from './pages/LoginPage';
import { StorefrontPage } from './pages/StorefrontPage';
import { NavigationComponent } from './components/NavigationComponent';

test.describe('11. Sessões Múltiplas', () => {

  test('11.1 Login em aba diferente', async ({ context }) => {
    // 1. Abrir duas abas com /login
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Clear cookies explicitly because playwright uses storageState by default
    await context.clearCookies();

    const loginPage1 = new LoginPage(page1);
    const loginPage2 = new LoginPage(page2);
    const storefrontPage2 = new StorefrontPage(page2);

    await loginPage1.goTo();
    await loginPage2.goTo();

    // 2. Fazer login na primeira aba
    await loginPage1.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);

    await page1.waitForURL('/');
    await expect(new NavigationComponent(page1).userDropdownContainer).toBeVisible();

    // 3. Acessar a aplicação na segunda aba
    await storefrontPage2.goTo();
    
    // - user-dropdown-container visível em ambas
    await expect(new NavigationComponent(page2).userDropdownContainer).toBeVisible();
  });

});
