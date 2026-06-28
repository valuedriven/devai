import { Page, expect } from '@playwright/test';

export class OrderPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/orders');
  }

  async viewOrder(id: string) {
    const row = this.page.locator('tr').filter({ hasText: id }).first();
    await expect(row).toBeVisible();
    await row.getByTitle(/Ver detalhes/i).click();
  }

  async transitionStatus(actionName: string) {
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.getByRole('button', { name: actionName }).click();
  }

  async openPaymentModal() {
    await this.page.getByRole('button', { name: /Registrar Pagamento/i }).click();
  }

    async fillPaymentForm(value: string, method: string) {
        await this.page.getByPlaceholder('0,00').fill(value);
        await this.page.locator('select').selectOption({ label: method });
        await this.page.locator('button[type="submit"]').filter({ hasText: /^Registrar$/ }).click();
    }
}
