import { expect, Locator, Page } from '@playwright/test';

export class CustomerPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly newCustomerLink: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly activeCheckbox: Locator;
  readonly saveCustomerButton: Locator;
  readonly dialog: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.table = page.getByRole('table');
    this.searchInput = page.getByPlaceholder('Pesquisar clientes...');
    this.newCustomerLink = page.getByRole('link', { name: /Novo Cliente/i });
    this.nameInput = page.getByLabel(/Nome Completo/i);
    this.emailInput = page.getByLabel(/E-mail/i);
    this.phoneInput = page.getByLabel(/Telefone/i);
    this.addressInput = page.getByLabel(/Endereço/i);
    this.activeCheckbox = page.getByLabel(/Cliente Ativo/i);
    this.saveCustomerButton = page.getByRole('button', { name: /Salvar Cliente/i });
    this.dialog = page.getByRole('dialog');
    this.confirmDeleteButton = this.dialog.getByRole('button', { name: /^Excluir$/i });
  }

  rowFor(name: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(name) });
  }

  async goTo(): Promise<this> {
    await this.page.goto('/admin/customers');
    await expect(this.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    return this;
  }

  async clickNewCustomer(): Promise<this> {
    await this.newCustomerLink.click();
    return this;
  }

  async fillCustomerDetails(
    name: string,
    email: string,
    phone: string,
    address: string,
    active = true
  ): Promise<this> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    await this.addressInput.fill(address);
    const isChecked = await this.activeCheckbox.isChecked();
    if (isChecked !== active) {
      await this.activeCheckbox.click();
    }
    return this;
  }

  async submitForm(): Promise<this> {
    await this.saveCustomerButton.click();
    return this;
  }

  async editCustomer(oldName: string, newName: string): Promise<this> {
    const row = this.table.getByRole('row', { name: new RegExp(oldName) });
    await expect(row).toBeVisible();
    await row.getByTitle('Editar').click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.submitForm();
    return this;
  }

  async deleteCustomer(name: string): Promise<this> {
    const row = this.table.getByRole('row', { name: new RegExp(name) });
    await expect(row).toBeVisible();
    await row.getByTitle('Excluir').click();
    await this.confirmDeleteButton.click();
    return this;
  }
}
