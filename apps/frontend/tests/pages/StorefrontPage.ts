import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';
import { ProductCardComponent } from '../components/ProductCardComponent';

export class StorefrontPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addToCartButton: Locator;
  readonly welcomeHeading: Locator;
  readonly highlightsHeading: Locator;
  readonly backToStoreLink: Locator;
  readonly productCards: Locator;
  readonly outOfStockBadge: Locator;
  readonly price: Locator;
  readonly notFoundMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 }).first();
    this.addToCartButton = page.getByRole('button', { name: /Adicionar ao Carrinho/i }).first();
    this.welcomeHeading = page.getByRole('heading', { name: 'Bem-vindo à DevAI Store' }).first();
    this.highlightsHeading = page.getByRole('heading', { name: 'Destaques' }).first();
    this.backToStoreLink = page.getByRole('link', { name: 'Voltar para a loja' }).first();
    this.productCards = page.locator('.products-grid').getByTestId('product-card');
    this.outOfStockBadge = page.getByRole('main').getByText('Esgotado').first();
    this.price = page.locator('main').locator('.text-4xl.font-bold.text-primary').first();
    this.notFoundMessage = page.getByText(/404|not found|não encontrad/i).first();
  }

  productCard(name: string): ProductCardComponent {
    return new ProductCardComponent(this.productCards.filter({ hasText: name }));
  }

  productCardByName(name: string): Locator {
    return this.productCards.filter({ hasText: name }).first();
  }

  categoryLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/');
    await expect(this.welcomeHeading).toBeVisible();
    return this;
  }



  async gotoProductDetail(productId: string): Promise<this> {
    await this.page.goto(`/products/${productId}`);
    await expect(this.heading).toBeVisible();
    return this;
  }

  async addToCartForProduct(productId: string): Promise<this> {
    await this.page.goto(`/products/${productId}`);
    await expect(this.addToCartButton).toBeVisible();
    await this.addToCartButton.click();
    return this;
  }
}
