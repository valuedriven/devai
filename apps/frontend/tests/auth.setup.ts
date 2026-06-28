// spec: openspec/changes/change-03-auth-security/test-plan.md
// Setup project — autentica ADMIN e CUSTOMER, persiste storageState

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.resolve(__dirname, '.auth/admin.json');
const CUSTOMER_AUTH_FILE = path.resolve(__dirname, '.auth/customer.json');

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;

  expect(email).toBeTruthy();
  expect(password).toBeTruthy();

  // 1. Navegar para /login
  await page.goto('/login');

  // 2. Preencher campo "E-mail" com ADMIN_EMAIL
  await page.getByLabel('E-mail').fill(email);

  // 3. Preencher campo "Senha" com ADMIN_PASSWORD
  await page.getByLabel('Senha', { exact: true }).fill(password);

  // 4. Clicar no botão "Entrar"
  await page.getByRole('button', { name: 'Entrar' }).click();

  // 5. Aguardar redirecionamento para /
  await page.waitForURL('/');

  // 6. Verificar user-dropdown-container visível
  await expect(page.getByTestId('user-dropdown-container')).toBeVisible();

  // 7. Salvar storageState
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('authenticate as customer', async ({ page }) => {
  const email = process.env.CUSTOMER_EMAIL!;
  const password = process.env.CUSTOMER_PASSWORD!;

  expect(email).toBeTruthy();
  expect(password).toBeTruthy();

  // 1. Navegar para /login
  await page.goto('/login');

  // 2. Preencher campo "E-mail" com CUSTOMER_EMAIL
  await page.getByLabel('E-mail').fill(email);

  // 3. Preencher campo "Senha" com CUSTOMER_PASSWORD
  await page.getByLabel('Senha', { exact: true }).fill(password);

  // 4. Clicar no botão "Entrar"
  await page.getByRole('button', { name: 'Entrar' }).click();

  // 5. Aguardar redirecionamento para /
  await page.waitForURL('/');

  // 6. Verificar user-dropdown-container visível
  await expect(page.getByTestId('user-dropdown-container')).toBeVisible();

  // 7. Salvar storageState
  await page.context().storageState({ path: CUSTOMER_AUTH_FILE });
});
