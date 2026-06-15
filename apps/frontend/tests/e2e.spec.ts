import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('test', async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
  await page.getByRole('link', { name: '1 Carrinho' }).click();
  await page.getByRole('button', { name: 'Faça login para confirmar' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('jps012009@yahoo.com.br');
  await page.getByRole('textbox', { name: 'E-mail' }).press('Shift+Home');
  await page.getByRole('textbox', { name: 'E-mail' }).press('ControlOrMeta+c');
  await page.getByRole('textbox', { name: 'E-mail' }).press('Tab');
  await page.getByRole('link', { name: 'Esqueceu a senha?' }).press('Tab');
  await page.getByRole('textbox', { name: 'Senha' }).fill('jps012009@yahoo.com.br');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('link', { name: '1 Carrinho' }).click();
  await page.getByRole('button', { name: 'Confirmar Pedido' }).click();
  await page.getByRole('button', { name: 'Ver Meus Pedidos' }).click();
  await page.getByRole('link', { name: 'Ver Detalhes' }).first().click();
  await page.getByRole('complementary').getByRole('button', { name: 'Sair da Loja' }).click();
});