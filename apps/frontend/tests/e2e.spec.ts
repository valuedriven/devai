import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('E2E Fluxo completo: adicionar ao carrinho, login, confirmar pedido, ver detalhes', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env variables must be set');
  }

  await setupClerkTestingToken({ page });
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
  await page.getByTestId('cart-icon-wrapper').click();
  await page.getByRole('button', { name: 'Faça login para confirmar' }).click();
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByTestId('cart-badge')).toHaveText('1');
  await page.getByTestId('cart-icon-wrapper').click();
  await page.getByRole('button', { name: 'Confirmar Pedido' }).click();
  await page.getByRole('button', { name: 'Ver Meus Pedidos' }).click();
  await page.getByRole('link', { name: 'Ver Detalhes' }).first().click();
  await page.getByRole('complementary').getByRole('button', { name: 'Sair da Loja' }).click();
});