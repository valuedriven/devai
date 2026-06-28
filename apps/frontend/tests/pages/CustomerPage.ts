import { Locator, Page } from '@playwright/test';

export class CustomerPage {
  readonly page: Page;
  readonly newCustomerLink: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly activeCheckbox: Locator;
  readonly saveCustomerButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newCustomerLink = page.getByRole('link', { name: /Novo Cliente/i });
    this.nameInput = page.getByLabel(/Nome Completo/i);
    this.emailInput = page.getByLabel(/E-mail/i);
    this.phoneInput = page.getByLabel(/Telefone/i);
    this.addressInput = page.getByLabel(/Endereço/i);
    this.activeCheckbox = page.getByLabel(/Cliente Ativo/i);
    this.saveCustomerButton = page.getByRole('button', { name: /Salvar Cliente/i });
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: /^Excluir$/i });
  }

  async goto() {
    await this.page.goto('/admin/customers');
  }

  async clickNewCustomer() {
    await this.newCustomerLink.click();
  }

  async fillCustomerDetails(name: string, email: string, phone: string, address: string, active = true) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    await this.addressInput.fill(address);
    const isChecked = await this.activeCheckbox.isChecked();
    if (isChecked !== active) {
      await this.activeCheckbox.click();
    }
  }

  async submitForm() {
    await this.saveCustomerButton.click();
  }

  async editCustomer(oldName: string, newName: string) {
    await this.page.locator('tr', { hasText: oldName }).getByTitle('Editar').click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.submitForm();
  }

  async deleteCustomer(name: string) {
    await this.page.locator('tr', { hasText: name }).getByTitle('Excluir').click();
    await this.confirmDeleteButton.click();
  }
}
