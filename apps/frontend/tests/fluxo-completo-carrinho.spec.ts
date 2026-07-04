import { test, expect } from './fixtures/baseTest';
import { createProduct, SeededProduct } from './utils/api';
import { makeProduct } from './utils/data';

test.describe('10. Regressão — Outros Fluxos', () => {

  test('10.0 Produto sem estoque: botão "Adicionar ao Carrinho" deve estar desabilitado', async ({
    page,
    request,
    adminAuthToken,
    seededCategory,
    storefrontPage,
  }) => {
    let product: SeededProduct;

    await test.step('seed product with stock = 0 via API', async () => {
      product = await createProduct(
        request,
        adminAuthToken,
        makeProduct(seededCategory.id, 0),
      );
    });

    await test.step('clear cookies and localStorage', async () => {
      await storefrontPage.goTo();
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('go to product detail page', async () => {
      await storefrontPage.gotoProductDetail(product.id);
    });

    await test.step('verify "Adicionar ao Carrinho" button is disabled', async () => {
      const button = storefrontPage.addToCartButton;
      await expect(button).toBeDisabled();
    });

    await test.step('verify "Esgotado" badge is visible', async () => {
      await expect(storefrontPage.outOfStockBadge).toBeVisible();
    });
  });

  test('10.1 Fluxo completo: adicionar ao carrinho → login → checkout → cancelar pedido', async ({
    page,
    seededProduct,
    cartPage,
    storefrontPage,
    loginPage,
    checkoutPage,
    customerOrdersPage,
  }) => {
    await test.step('clear authentication state', async () => {
      await page.context().clearCookies();
      await storefrontPage.goTo();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('add product to cart', async () => {
      await storefrontPage.addToCartForProduct(seededProduct.id);
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
        await expect(cartPage.confirmOrderButton).toBeVisible({ timeout: 15_000 });
      });

      await test.step('assert cart badge persists as 1 after login', async () => {
        await expect(cartPage.cartBadge).toHaveText('1');
      });

      await test.step('go to checkout', async () => {
        await cartPage.confirmOrder();
        await expect(checkoutPage.addressInput).toBeVisible();
      });

      await test.step('fill address and submit order', async () => {
        await checkoutPage.fillAddress('Rua Teste, 123');
        await checkoutPage.submitOrder();
      });

      let orderId = '';

      await test.step('verify order confirmation screen', async () => {
        await expect(checkoutPage.orderSuccessTitle).toBeVisible();

        orderId = await checkoutPage.getOrderIdFromSuccessText();
      });

      await test.step('navigate to orders history and verify order is listed', async () => {
        await checkoutPage.clickViewOrders();
        await expect(customerOrdersPage.heading).toBeVisible();
        await expect(customerOrdersPage.orderCard(orderId)).toBeVisible();
      });

      await test.step('filter orders by status', async () => {
        await customerOrdersPage.filterNovo.click();
        await expect(customerOrdersPage.orderCard(orderId)).toBeVisible();

        await customerOrdersPage.filterCancelado.click();
        await expect(customerOrdersPage.orderCard(orderId)).toBeHidden();

        await customerOrdersPage.filterTodos.click();
        await expect(customerOrdersPage.orderCard(orderId)).toBeVisible();
      });

      await test.step('cancel order from details page', async () => {
        await customerOrdersPage.cancelOrder(orderId);
        // We are currently on the Order Details page, not the Order List page.
        // Therefore, we check the status badge and the cancel button directly on the details page.
        await expect(page.getByText('Cancelado', { exact: true })).toBeVisible();
        await expect(page.getByTestId('cancel-order-button')).toBeHidden();
      });
  });

});
