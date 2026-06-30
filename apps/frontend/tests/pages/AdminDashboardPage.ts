import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';

export class AdminDashboardPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/admin');
    await expect(this.heading).toBeVisible();
    return this;
  }
}
