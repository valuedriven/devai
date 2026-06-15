import { test, expect } from '@playwright/test';
import { navigateAndWait } from './helpers';

test.describe('Suite A: Vitrine (RFN-01 / INT-01)', () => {

  test('A1: Home carrega grid de produtos', async ({ page }) => {
    await navigateAndWait(page, '/');
    const productCards = page.locator('.product-card');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('A2: Cada card exibe nome e preço', async ({ page }) => {
    await navigateAndWait(page, '/');
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard.locator('.product-title')).toBeVisible();
    await expect(firstCard.locator('.product-price')).toBeVisible();
  });

  test('A3: Busca filtra produtos', async ({ page }) => {
    // Get the first product name to search for
    await navigateAndWait(page, '/');
    const firstCard = page.locator('.product-card').first();
    const firstProductName = await firstCard.locator('.product-title').textContent();
    expect(firstProductName).toBeTruthy();

    // Search for it using URL param
    const searchTerm = firstProductName!.trim().substring(0, 5);
    await navigateAndWait(page, `/?search=${encodeURIComponent(searchTerm)}`);
    const cards = page.locator('.product-card');
    const visibleCount = await cards.count();
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('A4: Busca sem resultados mostra grid vazio', async ({ page }) => {
    await navigateAndWait(page, '/?search=zzzznonexistent999');
    const cards = page.locator('.product-card');
    const count = await cards.count();
    expect(count).toBe(0);
  });

  test('A5: Produto detail carrega', async ({ page }) => {
    await navigateAndWait(page, '/');
    const firstProductLink = page.locator('.product-title').first();
    const href = await firstProductLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Navigate to product detail
    await navigateAndWait(page, href!);
    // Should show the product page (check for h1 or product detail content)
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
