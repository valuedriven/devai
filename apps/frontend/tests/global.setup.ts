import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.clerk/user.json');

setup.describe.configure({ mode: 'serial' });

setup('global setup', async ({ page }) => {
  await clerkSetup();

  await setupClerkTestingToken({ page });

  await page.goto('/login');
  
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env variables are not set');
  }

  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('/');

  await page.context().storageState({ path: authFile });
});

