import { Locator, Page } from '@playwright/test';

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

  async clickCartIcon() {
    await this.cartIcon.first().click();
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async confirmOrder() {
    await this.confirmOrderButton.click();
  }
}
