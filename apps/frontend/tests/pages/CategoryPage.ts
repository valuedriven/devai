import { expect, Locator, Page } from '@playwright/test';

export class CategoryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newCategoryButton: Locator;
  readonly saveCategoryButton: Locator;
  readonly nameInput: Locator;
  readonly saveChangesButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly dialog: Locator;
  readonly categoryTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.newCategoryButton = page.getByRole('button', { name: /Nova Categoria/i });
    this.saveCategoryButton = page.getByRole('button', { name: /Salvar Categoria/i });
    this.nameInput = page.getByLabel(/Nome da Categoria/i);
    this.saveChangesButton = page.getByRole('button', { name: /Salvar Alterações/i });
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true });
    this.dialog = page.getByRole('dialog');
    this.categoryTable = page.getByRole('table');
  }

  rowFor(name: string): Locator {
    return this.categoryTable.getByRole('row', { name: new RegExp(name) });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/admin/categories');
    await expect(this.newCategoryButton).toBeVisible();
    return this;
  }

  async createCategory(name: string): Promise<this> {
    await this.newCategoryButton.click();
    await expect(this.dialog).toBeVisible();
    await this.nameInput.fill(name);
    await this.saveCategoryButton.click();
    return this;
  }

  async editCategory(oldName: string, newName: string): Promise<this> {
    const row = this.categoryTable.getByRole('row', { name: new RegExp(oldName) });
    await expect(row).toBeVisible();
    await row.getByTitle('Edit category').click();
    await expect(this.dialog).toBeVisible();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.saveChangesButton.click();
    return this;
  }

  async deleteCategory(name: string): Promise<this> {
    const row = this.categoryTable.getByRole('row', { name: new RegExp(name) });
    await expect(row).toBeVisible();
    await row.getByTitle('Delete category').click();
    await expect(this.confirmDeleteButton).toBeVisible();
    await this.confirmDeleteButton.click();
    return this;
  }
}
