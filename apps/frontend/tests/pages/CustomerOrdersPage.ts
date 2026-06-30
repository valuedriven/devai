import { expect, Locator, Page } from '@playwright/test';

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
    return this;
  }

  async goToOrderDetail(orderId: string): Promise<this> {
    await this.page.goto(`/orders/${orderId}`);
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
    await this.page.waitForURL(/\/orders\//);

    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    const cancelButton = this.page.getByTestId('cancel-order-button');
    await cancelButton.click();
    await expect(cancelButton).toBeHidden();

    // Navigate back to the orders list so callers can check the list view
    await this.page.goto('/orders');
    await this.page.waitForURL(/\/orders$/);
    return this;
  }
}
