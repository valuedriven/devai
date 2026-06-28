// spec: openspec/changes/change-08-order-creation/test-plan.md
import { test, expect } from './fixtures/baseTest';
import { createProduct, deleteProduct, SeededProduct } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('10. Regressão — Outros Fluxos', () => {

  test('10.0 Produto sem estoque: botão "Adicionar ao Carrinho" deve estar desabilitado', async ({
    page,
    request,
    authToken,
    seededCategory,
    storefrontPage,
  }) => {
    let product: SeededProduct;

    await test.step('seed product with stock = 0 via API', async () => {
      product = await createProduct(
        request,
        authToken,
        makeProduct(seededCategory.id, 0),
      );
    });

    try {
      await test.step('clear cookies and localStorage', async () => {
        await page.goto('/');
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.reload();
      });

      await test.step('go to product detail page', async () => {
        await storefrontPage.gotoProductDetail(product.id);
      });

      await test.step('verify "Adicionar ao Carrinho" button is disabled', async () => {
        const button = page.getByRole('button', { name: /Adicionar ao Carrinho/i });
        await expect(button).toBeDisabled();
      });

      await test.step('verify "Esgotado" badge is visible', async () => {
        await expect(page.getByText('Esgotado').first()).toBeVisible();
      });
    } finally {
      await test.step('cleanup seeded product', async () => {
        await deleteProduct(request, authToken, product?.id);
      });
    }
  });

  test('10.1 Fluxo completo: adicionar ao carrinho → login → checkout → cancelar pedido', async ({
    page,
    request,
    authToken,
    seededCategory,
    cartPage,
    storefrontPage,
    loginPage,
  }) => {
    let product: SeededProduct;

    await test.step('seed product via API', async () => {
      product = await createProduct(request, authToken, makeProduct(seededCategory.id));
    });

    try {
      await test.step('clear cookies and go to homepage', async () => {
        await page.context().clearCookies();
        await storefrontPage.goto();
        await page.evaluate(() => localStorage.clear());
        await page.reload();
      });

      await test.step('add product to cart', async () => {
        await storefrontPage.addToCart();
      });

      await test.step('go to cart page', async () => {
        await cartPage.clickCartIcon();
      });

      await test.step('assert cart badge value is 1', async () => {
        await expect(cartPage.cartBadge).toHaveText('1');
      });

      await test.step('click login from cart page', async () => {
        await cartPage.clickLogin();
      });

      await test.step('fill admin credentials and login', async () => {
        await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
        await page.waitForURL(/\/cart/);
      });

      await test.step('assert cart badge persists as 1 after login', async () => {
        await expect(cartPage.cartBadge).toHaveText('1');
      });

      await test.step('go to checkout', async () => {
        await cartPage.confirmOrder();
        await page.waitForURL(/\/checkout/);
      });

      await test.step('fill address and submit order', async () => {
        await page.locator('#address').fill('Rua Teste, 123');
        await page.getByRole('button', { name: /Confirmar e Fechar Pedido/i }).click();
      });

      let orderId = '';

      await test.step('verify order confirmation screen', async () => {
        await page.waitForURL(/\/checkout\/success/);
        await expect(page.getByTestId('order-success-title')).toBeVisible();

        const successText = await page.locator('.order-success-text strong').textContent();
        orderId = successText?.replace('#', '').trim() || '';
      });

      await test.step('navigate to orders history and verify order is listed', async () => {
        await page.getByRole('button', { name: /Ver Meus Pedidos/i }).click();
        await page.waitForURL(/\/orders/);
        await expect(page.locator(`text=Pedido #${orderId}`)).toBeVisible();
      });

      await test.step('filter orders by status', async () => {
        await page.getByTestId('filter-novo').click();
        await expect(page.locator(`text=Pedido #${orderId}`)).toBeVisible();

        await page.getByTestId('filter-cancelado').click();
        await expect(page.locator(`text=Pedido #${orderId}`)).toBeHidden();

        await page.getByTestId('filter-todos').click();
        await expect(page.locator(`text=Pedido #${orderId}`)).toBeVisible();
      });

      await test.step('cancel order from details page', async () => {
        await page.getByRole('button', { name: /Ver Detalhes/i }).first().click();
        await page.waitForURL(/\/orders\//);

        page.once('dialog', async dialog => {
          await dialog.accept();
        });

        await page.getByTestId('cancel-order-button').click();
        await expect(page.getByText('Cancelado')).toBeVisible();
        await expect(page.getByTestId('cancel-order-button')).toBeHidden();
      });
    } finally {
      await test.step('cleanup seeded product', async () => {
        await deleteProduct(request, authToken, product?.id);
      });
    }
  });

});
