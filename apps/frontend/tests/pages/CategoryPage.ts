import { Locator, Page } from '@playwright/test';

export class CategoryPage {
  readonly page: Page;
  readonly newCategoryButton: Locator;
  readonly saveCategoryButton: Locator;
  readonly nameInput: Locator;
  readonly saveChangesButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly dialog: Locator;
  readonly categoryTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newCategoryButton = page.getByRole('button', { name: /Nova Categoria/i });
    this.saveCategoryButton = page.getByRole('button', { name: /Salvar Categoria/i });
    this.nameInput = page.getByLabel(/Nome da Categoria/i);
    this.saveChangesButton = page.getByRole('button', { name: /Salvar Alterações/i });
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true });
    this.dialog = page.getByRole('dialog');
    this.categoryTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/admin/categories');
  }

  async createCategory(name: string) {
    await this.newCategoryButton.click();
    await this.nameInput.fill(name);
    await this.saveCategoryButton.dispatchEvent('click');
  }

  async editCategory(oldName: string, newName: string) {
    const editButton = this.categoryTable.locator('tr', { hasText: oldName }).getByTitle('Edit category');
    await editButton.click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.saveChangesButton.dispatchEvent('click');
  }

  async deleteCategory(name: string) {
    const deleteButton = this.categoryTable.locator('tr', { hasText: name }).getByTitle('Delete category');
    await deleteButton.click();
    await this.confirmDeleteButton.press('Enter');
  }
}
