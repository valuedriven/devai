import { Locator, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export class NavigationComponent {
  readonly page: Page;
  readonly desktopSidebar: Locator;
  readonly logoutButton: Locator;
  readonly loginLink: Locator;
  readonly userDropdownContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.desktopSidebar = page.getByTestId('sidebar-desktop');
    this.logoutButton = page.locator('.sidebar-logout-btn');
    this.loginLink = page.locator('.header-root').getByRole('link', { name: /Login/i });
    this.userDropdownContainer = page.getByTestId('user-dropdown-container');
  }

  async logout(): Promise<this> {
    await this.logoutButton.click();
    return this;
  }

  async clickLogin(): Promise<LoginPage> {
    await this.loginLink.click();
    return new LoginPage(this.page);
  }
}
