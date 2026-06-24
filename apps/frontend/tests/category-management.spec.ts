// E2E tests for category management (change-04-category-management)
import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to categories page
    await page.goto('/admin/categories');
  });

  test('9.1 Admin can create a category successfully', async ({ page }) => {
    const catName = `Eletrônicos Teste ${Date.now()}`;
    
    // Click "Nova Categoria" link to open the form page
    await page.getByRole('link', { name: /Nova Categoria/i }).click();

    // Wait for navigation to the form page
    await page.waitForURL(/\/admin\/categories\/new/);

    // Fill in category name
    await page.getByLabel(/Nome da Categoria/i).fill(catName);

    // Submit the form
    await page.getByRole('button', { name: /Salvar Categoria/i }).click();

    // Should navigate back to list with success message
    await page.waitForURL('**/admin/categories');

    // Category should appear in the table
    await expect(page.locator('table').getByText(catName)).toBeVisible();
  });

  test('9.2 Admin can edit a category', async ({ page }) => {
    const baseName = `Categoria para Editar ${Date.now()}`;
    const editName = `Categoria Editada ${Date.now()}`;

    // First create a category to edit
    await page.getByRole('link', { name: /Nova Categoria/i }).click();
    await page.waitForURL(/\/admin\/categories\/new/);
    await page.getByLabel(/Nome da Categoria/i).fill(baseName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).click();
    await page.waitForURL('**/admin/categories');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Find the edit link (pencil icon with title "Editar") for this category
    const editButton = page.locator('tr', { hasText: baseName }).getByTitle('Editar');
    await editButton.click();

    // Wait for navigation to the edit page
    await page.waitForURL(/\/admin\/categories\/.*\/edit/);

    // Clear and fill new name
    const editNameInput = page.getByLabel(/Nome da Categoria/i);
    await editNameInput.clear();
    await editNameInput.fill(editName);

    // Submit the form
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();

    // Should navigate back to list
    await page.waitForURL('**/admin/categories');

    // Updated category should appear in the table
    await expect(page.locator('table').getByText(editName)).toBeVisible();
  });

  test('9.3 Admin can delete a category', async ({ page }) => {
    const delName = `Categoria para Excluir ${Date.now()}`;

    // First create a category to delete
    await page.getByRole('link', { name: /Nova Categoria/i }).click();
    await page.waitForURL(/\/admin\/categories\/new/);
    await page.getByLabel(/Nome da Categoria/i).fill(delName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).click();
    await page.waitForURL('**/admin/categories');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Find the delete button for this category
    const deleteButton = page.locator('tr', { hasText: delName }).getByTitle('Excluir');
    await deleteButton.click();

    // Click confirm in the custom React dialog
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).click();

    // Wait for the delete to complete and refresh
    await page.waitForTimeout(1000);

    // Category should no longer appear in the table
    await expect(page.locator('table').getByText(delName)).not.toBeVisible();
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
    await page.getByRole('link', { name: /Nova Categoria/i }).click();
    await page.waitForURL(/\/admin\/categories\/new/);
    await page.getByLabel(/Nome da Categoria/i).fill(metaName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).click();
    await page.waitForURL('**/admin/categories');

    // Verify in list
    await expect(page.locator('table').getByText(metaName)).toBeVisible();

    // Edit
    const editButton = page.locator('tr', { hasText: metaName }).getByTitle('Editar');
    await editButton.click();
    await page.waitForURL(/\/admin\/categories\/.*\/edit/);
    await page.getByLabel(/Nome da Categoria/i).fill(metaEditName);
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    await page.waitForURL('**/admin/categories');

    // Delete
    const deleteButton = page.locator('tr', { hasText: metaEditName }).getByTitle('Excluir');
    await deleteButton.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir', exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('table').getByText(metaEditName)).not.toBeVisible();
  });

});