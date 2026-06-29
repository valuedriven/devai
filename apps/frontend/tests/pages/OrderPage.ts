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
        const input = this.page.getByPlaceholder('0,00');
        await input.waitFor({ state: 'visible' });
        await input.fill(value);
        await this.page.locator('select').selectOption({ label: method });
        await input.press('Enter');
    }
}
