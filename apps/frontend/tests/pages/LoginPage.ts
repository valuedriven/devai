import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseTest';


export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/e-?mail/i);
    this.passwordInput = page.getByLabel(/senha/i);
    this.submitButton = page.getByRole('button', { name: /entrar/i });
    this.loginError = page.getByTestId('login-error');
  }

  async goTo(): Promise<this> {
    await this.page.goto('/login');
    await expect(this.emailInput).toBeVisible();
    return this;
  }

  async login(email: string, pass: string): Promise<void> {
    // Wait for React to finish mounting the form before interacting
    await this.page.locator('form.login-form[data-state="ready"]').waitFor({ timeout: 10_000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
