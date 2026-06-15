import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';
import { navigateAndWait, generateUniqueEmail, generateTestPassword } from './helpers';

const PASSWORD = generateTestPassword();

test.describe('Suite D: Fluxo de Compra (RFN-02)', () => {
  // Reset storageState to run tests logged out
  test.use({ storageState: { cookies: [], origins: [] } });

  test('D1: Fluxo completo - registro, compra e visualização', async ({ page }) => {
    const email = generateUniqueEmail();

    // Step 1: Add product to cart
    await navigateAndWait(page, '/');
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
    await expect(page.locator('.cart-badge')).toHaveText('1');

    // Step 2: Go to cart
    await page.locator('.cart-icon-wrapper').click();
    await page.waitForURL('/cart');

    // Step 3: Click login to confirm → should go to /login
    await page.getByRole('button', { name: 'Faça login para confirmar' }).click();
    await page.waitForURL('/login');

    // Step 4: Navigate to register page
    await setupClerkTestingToken({ page });
    await navigateAndWait(page, '/register');

    // Step 5: Register new customer
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill('Buyer');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('#confirmPassword').fill(PASSWORD);
    await page.getByRole('button', { name: 'Cadastrar' }).click();
    await page.waitForURL('/');

    // Step 6: Re-add product to cart (cart was lost during Clerk redirect after registration)
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).first().click();
    await expect(page.locator('.cart-badge')).toHaveText('1');

    // Step 7: Go to cart
    await page.locator('.cart-icon-wrapper').click();
    await page.waitForURL('/cart');

    // Step 8: Confirm order
    const confirmBtn = page.getByRole('button', { name: 'Confirmar Pedido' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Step 9: Verify order confirmation screen
    await expect(page.locator('.order-success-container')).toBeVisible();
    await expect(page.locator('.order-success-title', { hasText: 'Pedido Confirmado!' })).toBeVisible();
    await expect(page.locator('text=Ver Meus Pedidos')).toBeVisible();

    // Step 10: Navigate to orders
    await page.getByRole('button', { name: 'Ver Meus Pedidos' }).click();
    await page.waitForURL('/orders');
    await expect(page.locator('h1', { hasText: 'Meus Pedidos' })).toBeVisible();
    const orderCards = page.locator('.card');
    await expect(orderCards.first()).toBeVisible();

    // Step 11: View order details
    await page.getByRole('link', { name: 'Ver Detalhes' }).first().click();
    await page.waitForURL(/\/orders\/\d+/);
    // Should show order detail
    const orderIdFromUrl = page.url().match(/\/orders\/(\d+)/)?.[1];
    expect(orderIdFromUrl).toBeTruthy();
    await expect(page.locator(`text=#${orderIdFromUrl}`).first()).toBeVisible();
  });
});
