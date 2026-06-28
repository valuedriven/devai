import { Locator, Page } from '@playwright/test';

export class NavigationComponent {
  readonly page: Page;
  readonly desktopSidebar: Locator;
  readonly logoutButton: Locator;
  readonly loginLink: Locator;
  readonly userDropdownContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.desktopSidebar = page.locator('.sidebar-desktop');
    this.logoutButton = page.getByRole('button', { name: /Sair da Loja/i });
    this.loginLink = page.getByRole('link', { name: /Login/i });
    this.userDropdownContainer = page.getByTestId('user-dropdown-container');
  }

  async logout() {
    await this.logoutButton.first().click();
  }

  async clickLogin() {
    await this.loginLink.first().click();
  }
}
