import { Locator, Page } from '@playwright/test';

export class ToastComponent {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('toast-container');
  }

  message(text: string | RegExp): Locator {
    return this.container.getByTestId('toast-message').filter({ hasText: text });
  }

  success(text: string | RegExp): Locator {
    return this.container
      .locator('[data-toast-type="success"]')
      .filter({ hasText: text });
  }

  error(text: string | RegExp): Locator {
    return this.container
      .locator('[data-toast-type="error"]')
      .filter({ hasText: text });
  }
}
