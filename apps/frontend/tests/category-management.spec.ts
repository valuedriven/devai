// E2E tests for category management (change-04-category-management)
import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to categories page
    await page.goto('/admin/categories');
  });

  test('9.1 Admin can create a category successfully', async ({ page }) => {
    const catName = `Eletrônicos Teste ${Date.now()}`;
    
    // Click "Nova Categoria" button to open the modal form
    await page.getByRole('button', { name: /Nova Categoria/i }).click();

    // Wait for the modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in category name
    await page.getByLabel(/Nome da Categoria/i).fill(catName);

    // Submit the form
    await page.getByRole('button', { name: /Salvar Categoria/i }).dispatchEvent('click');

    // Modal should disappear
    await expect(page.getByRole('dialog')).toBeHidden();

    // Category should appear in the table
    await expect(page.locator('table').getByText(catName)).toBeVisible();
  });

  test('9.2 Admin can edit a category', async ({ page }) => {
    const baseName = `Categoria para Editar ${Date.now()}`;
    const editName = `Categoria Editada ${Date.now()}`;

    // First create a category to edit
    await page.getByRole('button', { name: /Nova Categoria/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/Nome da Categoria/i).fill(baseName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).dispatchEvent('click');
    await expect(page.getByRole('dialog')).toBeHidden();

    // Find the edit link (pencil icon with title "Edit category") for this category
    const editButton = page.locator('tr', { hasText: baseName }).getByTitle('Edit category');
    await editButton.click();

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Clear and fill new name
    const editNameInput = page.getByLabel(/Nome da Categoria/i);
    await editNameInput.clear();
    await editNameInput.fill(editName);

    // Submit the form
    await page.getByRole('button', { name: /Salvar Alterações/i }).dispatchEvent('click');

    // Modal should disappear
    await expect(page.getByRole('dialog')).toBeHidden();

    // Updated category should appear in the table
    await expect(page.locator('table').getByText(editName)).toBeVisible();
  });

  test('9.3 Admin can delete a category', async ({ page }) => {
    const delName = `Categoria para Excluir ${Date.now()}`;

    // First create a category to delete
    await page.getByRole('button', { name: /Nova Categoria/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/Nome da Categoria/i).fill(delName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).dispatchEvent('click');
    await expect(page.getByRole('dialog')).toBeHidden();

    // Find the delete button for this category
    const deleteButton = page.locator('tr', { hasText: delName }).getByTitle('Delete category');
    await deleteButton.click();

    // Click confirm in the custom React dialog
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).press('Enter');

    // Wait for delete dialog to close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 });

    // Category should no longer appear in the table
    await expect(page.locator('table').getByText(delName)).toBeHidden();
  });

  test('9.4 Non-admin user cannot access /admin/categories', async ({ page }) => {
    // First log out if logged in
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Log in as a non-admin user
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(process.env.CUSTOMER_EMAIL || 'jps012009@yahoo.com.br');
    await page.getByLabel('Senha', { exact: true }).fill(process.env.CUSTOMER_PASSWORD || 'jps012009@yahoo.com.br');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('/');

    // Try to access admin categories page
    await page.goto('/admin/categories');

    // Should be redirected to 403 page
    await expect(page.getByText(/403/i)).toBeVisible({ timeout: 5000 });
  });

  test('9.5 All category management tests pass', async ({ page }) => {
    const metaName = `Teste Completo ${Date.now()}`;
    const metaEditName = `Teste Editado ${Date.now()}`;

    // This is a meta-test that verifies all category functionality works together
    // Create
    await page.getByRole('button', { name: /Nova Categoria/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/Nome da Categoria/i).fill(metaName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).dispatchEvent('click');
    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify in list
    await expect(page.locator('table').getByText(metaName)).toBeVisible();

    // Edit
    const editButton = page.locator('tr', { hasText: metaName }).getByTitle('Edit category');
    await editButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/Nome da Categoria/i).fill(metaEditName);
    await page.getByRole('button', { name: /Salvar Alterações/i }).dispatchEvent('click');
    await expect(page.getByRole('dialog')).toBeHidden();

    // Delete
    const deleteButton = page.locator('tr', { hasText: metaEditName }).getByTitle('Delete category');
    await deleteButton.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).press('Enter');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 });
    await expect(page.locator('table').getByText(metaEditName)).toBeHidden();
  });

});