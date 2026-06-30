import { Locator, Page } from '@playwright/test';

export class ForbiddenPage {
  readonly page: Page;
  readonly code: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.code = page.getByText('403');
    this.message = page.getByText('Acesso Negado');
  }
}
