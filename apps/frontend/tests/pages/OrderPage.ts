import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';

export class OrderPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly paymentModalButton: Locator;
  readonly paymentValueInput: Locator;
  readonly paymentMethodSelect: Locator;
  readonly paymentSubmitButton: Locator;
  readonly dialog: Locator;
  readonly auditLog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.table = page.getByRole('table');
    this.searchInput = page.getByPlaceholder(/Pesquisar/i);
    this.paymentModalButton = page.getByRole('button', { name: /Registrar Pagamento/i });
    this.paymentValueInput = page.getByRole('spinbutton', { name: /valor do pagamento/i });
    this.paymentMethodSelect = page.getByRole('combobox');
    this.paymentSubmitButton = page.getByRole('button', { name: 'Registrar', exact: true });
    this.dialog = page.locator('.fixed.inset-0');
    this.auditLog = page.getByTestId('audit-log');
  }

  rowFor(text: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(text) });
  }

  statusBadge(status: string): Locator {
    return this.page.getByTestId('order-status-badge').filter({ hasText: status }).first();
  }

  async goTo(): Promise<this> {
    await this.page.goto('/admin/orders');
    await expect(this.table).toBeVisible();
    return this;
  }

  async goToOrderDetail(orderId: string): Promise<this> {
    await this.page.goto(`/admin/orders/${orderId}`);
    await expect(this.heading.filter({ hasText: /Pedido #/i })).toBeVisible();
    return this;
  }

  async searchOrder(query: string): Promise<this> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    return this;
  }

  async viewOrder(id: string): Promise<this> {
    const row = this.table.getByRole('row', { name: new RegExp(id) });
    await row.getByTitle(/Ver detalhes/i).click();
    return this;
  }


  async transitionStatus(actionName: string): Promise<this> {
    const button = this.page.getByRole('button', { name: new RegExp(actionName, 'i') });
    this.page.once('dialog', dialog => dialog.accept());
    await button.click();
    await expect(button).toBeHidden();
    return this;
  }

  async openPaymentModal(): Promise<this> {
    await this.paymentModalButton.click();
    await expect(this.dialog).toBeVisible();
    return this;
  }

  async fillPaymentForm(value: string, method: string): Promise<this> {
    await expect(this.paymentValueInput).toBeVisible();
    await this.paymentValueInput.fill(value);
    await this.paymentMethodSelect.selectOption({ label: method });
    await this.paymentSubmitButton.click();
    return this;
  }
}
