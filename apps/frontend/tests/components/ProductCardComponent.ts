import { Locator } from '@playwright/test';

export class ProductCardComponent {
  readonly name: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly outOfStockBadge: Locator;
  readonly unavailableButton: Locator;

  constructor(root: Locator) {
    this.name = root.getByRole('heading');
    this.price = root.getByTestId('product-price');
    this.addButton = root.getByRole('button', { name: /adicionar/i });
    this.outOfStockBadge = root.getByText('Esgotado');
    this.unavailableButton = root.getByRole('button', { name: /indisponível/i });
  }
}
