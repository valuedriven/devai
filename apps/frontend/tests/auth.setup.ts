// spec: openspec/changes/change-03-auth-security/test-plan.md
// Setup project — autentica ADMIN e CUSTOMER, persiste storageState

import { test as setup, expect } from './fixtures/baseTest';
import path from 'path';

const ADMIN_AUTH_FILE = path.resolve(__dirname, '.auth/admin.json');
const CUSTOMER_AUTH_FILE = path.resolve(__dirname, '.auth/customer.json');

setup('authenticate as admin', async ({ loginPage, storefrontPage, page }) => {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;

  expect(email).toBeTruthy();
  expect(password).toBeTruthy();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  // Navegar para /login & autenticar usando LoginPage POM
  await loginPage.goTo();
  await loginPage.login(email, password);

  // Aguardar redirecionamento para / e verificar user-dropdown-container visível
  await expect(storefrontPage.welcomeHeading).toBeVisible();
  await expect(page.getByTestId('user-dropdown-container')).toBeVisible();

  // Salvar storageState
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('authenticate as customer', async ({ loginPage, storefrontPage, page }) => {
  const email = process.env.CUSTOMER_EMAIL!;
  const password = process.env.CUSTOMER_PASSWORD!;

  expect(email).toBeTruthy();
  expect(password).toBeTruthy();

  // Navegar para /login & autenticar usando LoginPage POM
  await loginPage.goTo();
  await loginPage.login(email, password);

  // Aguardar redirecionamento para / e verificar user-dropdown-container visível
  await expect(storefrontPage.welcomeHeading).toBeVisible();
  await expect(page.getByTestId('user-dropdown-container')).toBeVisible();

  // Salvar storageState
  await page.context().storageState({ path: CUSTOMER_AUTH_FILE });
});
