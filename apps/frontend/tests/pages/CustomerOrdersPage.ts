import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';

export class CustomerOrdersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly orderList: Locator;
  readonly filterNovo: Locator;
  readonly filterCancelado: Locator;
  readonly filterTodos: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Meus Pedidos/i });
    this.orderList = page.getByTestId('order-list');
    this.filterNovo = page.getByTestId('filter-novo');
    this.filterCancelado = page.getByTestId('filter-cancelado');
    this.filterTodos = page.getByTestId('filter-todos');
  }

  orderCard(orderId: string): Locator {
    return this.page
      .getByTestId('order-card')
      .filter({ hasText: `Pedido #${orderId}` })
      .first();
  }

  async goTo(): Promise<this> {
    await this.page.goto('/orders');
    await expect(this.heading).toBeVisible();
    return this;
  }

  async goToOrderDetail(orderId: string): Promise<this> {
    await this.page.goto(`/orders/${orderId}`);
    await expect(this.page.getByRole('heading', { name: new RegExp(`Pedido #${orderId}`, 'i') })).toBeVisible();
    return this;
  }

  async viewOrderDetails(orderId: string): Promise<this> {
    const card = this.orderCard(orderId);
    await card.getByRole('button', { name: /Ver Detalhes/i }).click();
    return this;
  }

  async cancelOrder(orderId: string): Promise<this> {
    const card = this.orderCard(orderId);
    await card.getByRole('button', { name: /Ver Detalhes/i }).click();

    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    const cancelButton = this.page.getByTestId('cancel-order-button');
    await cancelButton.click();
    await expect(cancelButton).toBeHidden();

    return this;
  }
}
