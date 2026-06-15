import { test, expect } from '@playwright/test';
import { navigateAndWait } from './helpers';

test.describe('Suite C: Carrinho (INT-03)', () => {
  // Reset storageState to run tests logged out
  test.use({ storageState: { cookies: [], origins: [] } });

  test('C1: Adicionar item ao carrinho atualiza badge', async ({ page }) => {
    await navigateAndWait(page, '/');
    const addBtn = page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first();
    await addBtn.click();
    // Cart badge should appear with "1"
    const cartBadge = page.locator('.cart-badge');
    await expect(cartBadge).toHaveText('1');
  });

  test('C2: Carrinho exibe itens adicionados', async ({ page }) => {
    await navigateAndWait(page, '/');
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
    await page.locator('.cart-icon-wrapper').click();
    await page.waitForURL('/cart');

    // Should have items in the cart
    await expect(page.locator('h1', { hasText: 'Carrinho de Compras' })).toBeVisible();
    const cartCards = page.locator('.card');
    await expect(cartCards.first()).toBeVisible();
  });

  test('C3: Alterar quantidade no carrinho', async ({ page }) => {
    await navigateAndWait(page, '/');
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
    await page.locator('.cart-icon-wrapper').click();
    await page.waitForURL('/cart');

    // Click "+" to increase quantity
    const plusButton = page.getByRole('button', { name: '+' }).first();
    await plusButton.click();
    // Quantity should show "2"
    const qtySpan = page.locator('.card .text-center').first();
    await expect(qtySpan).toHaveText('2');
  });

  test('C4: Remover item do carrinho', async ({ page }) => {
    await navigateAndWait(page, '/');
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
    await page.locator('.cart-icon-wrapper').click();
    await page.waitForURL('/cart');

    // Remove item
    const removeBtn = page.getByRole('button', { name: /Remover/ }).first();
    await removeBtn.click();

    // Should show empty cart message
    await expect(page.locator('text=Seu carrinho está vazio.')).toBeVisible();
  });

  test('C5: Carrinho vazio mostra estado vazio', async ({ page }) => {
    await navigateAndWait(page, '/cart');
    await expect(page.locator('text=Seu carrinho está vazio.')).toBeVisible();
  });

  test('C6: "Faça login para confirmar" quando não autenticado', async ({ page }) => {
    await navigateAndWait(page, '/');
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
    await page.locator('.cart-icon-wrapper').click();
    await page.waitForURL('/cart');

    // Check for the login prompt button
    const loginBtn = page.getByRole('button', { name: 'Faça login para confirmar' });
    await expect(loginBtn).toBeVisible();
  });
});
