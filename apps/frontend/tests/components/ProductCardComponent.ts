import { Locator } from '@playwright/test';

export class ProductCardComponent {
  readonly name: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly outOfStockBadge: Locator;
  readonly unavailableButton: Locator;

  constructor(root: Locator) {
    this.name = root.getByRole('heading').first();
    this.price = root.getByTestId('product-price').first();
    this.addButton = root.getByRole('button', { name: /adicionar/i }).first();
    this.outOfStockBadge = root.getByText('Esgotado').first();
    this.unavailableButton = root.getByRole('button', { name: /indisponível/i }).first();
  }
}
