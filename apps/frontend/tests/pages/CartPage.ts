import { expect, Locator, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';

export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly loginButton: Locator;
  readonly confirmOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.getByTestId('cart-icon-wrapper');
    this.cartBadge = page.getByTestId('cart-badge');
    this.loginButton = page.getByRole('button', { name: /Faça login/i });
    this.confirmOrderButton = page.getByRole('button', { name: /Checkout/i });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/cart');
    await expect(this.cartIcon).toBeVisible();
    return this;
  }

  async clickCartIcon(): Promise<this> {
    await this.cartIcon.first().click();
    return this;
  }

  async clickLogin(): Promise<LoginPage> {
    await this.loginButton.click();
    await this.page.waitForURL(/\/login/);
    return new LoginPage(this.page);
  }

  async confirmOrder(): Promise<this> {
    await this.confirmOrderButton.click();
    return this;
  }
}
