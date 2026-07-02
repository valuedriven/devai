import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';

export class ProductPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly table: Locator;
  readonly newProductLink: Locator;
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly saveProductButton: Locator;
  readonly dialog: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.table = page.getByRole('table');
    this.newProductLink = page.getByRole('link', { name: /Novo Produto/i });
    this.nameInput = page.getByLabel(/Nome do Produto/i);
    this.priceInput = page.getByLabel(/Preço/i);
    this.stockInput = page.getByLabel(/Estoque/i);
    this.descriptionInput = page.getByLabel(/Descrição/i);
    this.categorySelect = page.getByLabel(/Categoria/i, { exact: true });
    this.saveProductButton = page.getByRole('button', { name: /Salvar Produto/i });
    this.dialog = page.getByRole('dialog');
    this.confirmDeleteButton = this.dialog.getByRole('button', { name: /^Excluir$/i });
  }

  rowFor(name: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(name) });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/admin/products');
    await expect(this.heading.filter({ hasText: 'Produtos' })).toBeVisible();
    return this;
  }

  async clickNewProduct(): Promise<this> {
    await this.newProductLink.click();
    return this;
  }

  async fillProductDetails(
    name: string,
    price: string,
    stock: string,
    description: string,
    categoryId: string
  ): Promise<this> {
    await this.nameInput.fill(name);
    await this.priceInput.fill(price);
    await this.stockInput.fill(stock);
    await this.descriptionInput.fill(description);
    await expect(this.categorySelect.getByRole('option').nth(1)).toBeAttached({ timeout: 10000 });
    await this.categorySelect.selectOption({ value: categoryId });
    return this;
  }

  async submitForm(): Promise<this> {
    await this.saveProductButton.click();
    return this;
  }

  async editProduct(oldName: string, newName: string): Promise<this> {
    const row = this.table.getByRole('row', { name: new RegExp(oldName) });
    await expect(row).toBeVisible();
    await row.getByTitle('Editar').click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.submitForm();
    return this;
  }

  async deleteProduct(name: string): Promise<this> {
    const row = this.table.getByRole('row', { name: new RegExp(name) });
    await expect(row).toBeVisible();
    await row.getByTitle('Excluir').click();
    await expect(this.dialog).toBeVisible();
    await this.confirmDeleteButton.click();
    await expect(this.dialog).toBeHidden();
    return this;
  }
}
