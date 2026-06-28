import { Locator, Page } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly newProductLink: Locator;
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly saveProductButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newProductLink = page.getByRole('link', { name: /Novo Produto/i });
    this.nameInput = page.getByLabel(/Nome do Produto/i);
    this.priceInput = page.getByLabel(/Preço/i);
    this.stockInput = page.getByLabel(/Estoque/i);
    this.descriptionInput = page.getByLabel(/Descrição/i);
    this.categorySelect = page.getByLabel(/Categoria/i, { exact: true });
    this.saveProductButton = page.getByRole('button', { name: /Salvar Produto/i });
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: /^Excluir$/i });
  }

  async goto() {
    await this.page.goto('/admin/products');
  }

  async clickNewProduct() {
    await this.newProductLink.click();
  }

  async fillProductDetails(name: string, price: string, stock: string, description: string, categoryId: string) {
    await this.nameInput.fill(name);
    await this.priceInput.fill(price);
    await this.stockInput.fill(stock);
    await this.descriptionInput.fill(description);
    await this.categorySelect.locator('option').nth(1).waitFor({ state: 'attached', timeout: 10000 });
    await this.categorySelect.selectOption({ value: categoryId });
  }

  async submitForm() {
    await this.saveProductButton.click();
  }

  async editProduct(oldName: string, newName: string) {
    await this.page.locator('tr', { hasText: oldName }).getByTitle('Editar').click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.submitForm();
  }

  async deleteProduct(name: string) {
    await this.page.locator('tr', { hasText: name }).getByTitle('Excluir').click();
    await this.confirmDeleteButton.click();
  }
}
