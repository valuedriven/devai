import { expect, Locator, Page } from '@playwright/test';
import { CustomerOrdersPage } from './CustomerOrdersPage';

export class CheckoutPage {
  readonly page: Page;
  readonly addressInput: Locator;
  readonly submitOrderButton: Locator;
  readonly orderSuccessTitle: Locator;
  readonly orderSuccessText: Locator;
  readonly viewOrdersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addressInput = page.getByLabel('Endereço Completo');
    this.submitOrderButton = page.getByRole('button', { name: /Confirmar e Fechar Pedido/i });
    this.orderSuccessTitle = page.getByTestId('order-success-title');
    this.orderSuccessText = page.getByTestId('order-success-text');
    this.viewOrdersButton = page.getByRole('button', { name: /Ver Meus Pedidos/i });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/checkout');
    await expect(this.addressInput).toBeVisible();
    return this;
  }

  async fillAddress(address: string): Promise<this> {
    await this.addressInput.fill(address);
    return this;
  }

  async submitOrder(): Promise<this> {
    await this.submitOrderButton.click();
    return this;
  }

  async clickViewOrders(): Promise<CustomerOrdersPage> {
    await this.viewOrdersButton.click();
    return new CustomerOrdersPage(this.page);
  }

  async getOrderIdFromSuccessText(): Promise<string> {
    const successText = await this.orderSuccessText.textContent();
    return successText?.replace('#', '').trim() || '';
  }
}
