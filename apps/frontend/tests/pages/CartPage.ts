import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';


export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly loginButton: Locator;
  readonly confirmOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.getByTestId('cart-icon-wrapper').first();
    this.cartBadge = page.getByTestId('cart-badge').first();
    this.loginButton = page.getByRole('button', { name: /Faça login/i });
    this.confirmOrderButton = page.getByRole('button', { name: /Checkout/i });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/cart');
    await expect(this.cartIcon).toBeVisible();
    return this;
  }

  async clickCartIcon(): Promise<this> {
    await this.cartIcon.click();
    return this;
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async confirmOrder(): Promise<this> {
    await this.confirmOrderButton.click();
    return this;
  }
}
