import { Locator, Page } from '@playwright/test';

export class StorefrontPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly welcomeHeading: Locator;
  readonly highlightsHeading: Locator;
  readonly backToStoreLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /Adicionar ao Carrinho/i });
    this.welcomeHeading = page.getByText('Bem-vindo à DevAI Store').first();
    this.highlightsHeading = page.getByText('Destaques').first();
    this.backToStoreLink = page.getByText('Voltar para a loja').first();
  }

  async goto() {
    await this.page.goto('/');
  }

  async addToCart() {
    await this.addToCartButton.first().click();
  }

  async gotoProductDetail(productId: string) {
    await this.page.goto(`/products/${productId}`);
  }
}
