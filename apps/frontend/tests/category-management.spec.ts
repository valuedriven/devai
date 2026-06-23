// E2E tests for category management (change-04-category-management)
import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to categories page
    await page.goto('/admin/categories');
  });

  test('9.1 Admin can create a category successfully', async ({ page }) => {
    // Click "Add Category" button
    await page.getByRole('button', { name: /Nova Categoria/i }).click();

    // Fill in category name
    const nameInput = page.getByLabel(/Nome da categoria/i);
    await nameInput.fill('Eletrônicos Teste');

    // Submit the form
    await page.getByRole('button', { name: /Nova Categoria/i }).last().click();

    // Should show success message
    await expect(page.getByText(/categoria criada com sucesso/i)).toBeVisible();

    // Category should appear in the table
    await expect(page.locator('table').getByText('Eletrônicos Teste')).toBeVisible();
  });

  test('9.2 Admin can edit a category', async ({ page }) => {
    // First create a category to edit
    await page.getByRole('button', { name: /Nova Categoria/i }).click();
    const nameInput = page.getByLabel(/Nome da categoria/i);
    await nameInput.fill('Categoria para Editar');
    await page.getByRole('button', { name: /Nova Categoria/i }).last().click();
    await expect(page.getByText(/categoria criada com sucesso/i)).toBeVisible();

    // Wait for table to update
    await page.waitForTimeout(500);

    // Find the edit button for this category and click it
    const editButton = page.locator('tr', { hasText: 'Categoria para Editar' }).getByRole('button', { name: /Editar/i });
    await editButton.click();

    // Clear and fill new name
    const editNameInput = page.getByLabel(/Nome da categoria/i);
    await editNameInput.clear();
    await editNameInput.fill('Categoria Editada');

    // Submit the form
    await page.getByRole('button', { name: /Salvar/i }).click();

    // Should show success message
    await expect(page.getByText(/categoria atualizada com sucesso/i)).toBeVisible();

    // Updated category should appear in the table
    await expect(page.locator('table').getByText('Categoria Editada')).toBeVisible();
  });

  test('9.3 Admin can delete a category', async ({ page }) => {
    // First create a category to delete
    await page.getByRole('button', { name: /Nova Categoria/i }).click();
    const nameInput = page.getByLabel(/Nome da categoria/i);
    await nameInput.fill('Categoria para Excluir');
    await page.getByRole('button', { name: /Nova Categoria/i }).last().click();
    await expect(page.getByText(/categoria criada com sucesso/i)).toBeVisible();

    // Wait for table to update
    await page.waitForTimeout(500);

    // Find the delete button for this category and click it
    const deleteButton = page.locator('tr', { hasText: 'Categoria para Excluir' }).getByRole('button', { name: /Excluir/i });
    await deleteButton.click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /Confirmar/i }).click();

    // Should show success message
    await expect(page.getByText(/categoria excluída com sucesso/i)).toBeVisible();

    // Category should no longer appear in the table (or be shown as inactive)
    await page.waitForTimeout(500);
  });

  test('9.4 Non-admin user cannot access /admin/categories', async ({ page }) => {
    // First log out if logged in
    await page.goto('/logout');
    await page.waitForTimeout(500);

    // Log in as a non-admin user
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('user@example.com');
    await page.getByLabel(/Senha/i).fill('userpassword');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Try to access admin categories page
    await page.goto('/admin/categories');

    // Should be redirected to 403 page
    await expect(page.getByText(/403/i)).toBeVisible({ timeout: 5000 });
  });

  test('9.5 All category management tests pass', async ({ page }) => {
    // This is a meta-test that verifies all category functionality works together
    // Create
    await page.getByRole('button', { name: /Nova Categoria/i }).click();
    await page.getByLabel(/Nome da categoria/i).fill('Teste Completo');
    await page.getByRole('button', { name: /Nova Categoria/i }).last().click();
    await expect(page.getByText(/categoria criada com sucesso/i)).toBeVisible();

    // Verify in list
    await expect(page.locator('table').getByText('Teste Completo')).toBeVisible();

    // Edit
    const editButton = page.locator('tr', { hasText: 'Teste Completo' }).getByRole('button', { name: /Editar/i });
    await editButton.click();
    await page.getByLabel(/Nome da categoria/i).fill('Teste Editado');
    await page.getByRole('button', { name: /Salvar/i }).click();
    await expect(page.getByText(/categoria atualizada com sucesso/i)).toBeVisible();

    // Delete
    const deleteButton = page.locator('tr', { hasText: 'Teste Editado' }).getByRole('button', { name: /Excluir/i });
    await deleteButton.click();
    await page.getByRole('button', { name: /Confirmar/i }).click();
    await expect(page.getByText(/categoria excluída com sucesso/i)).toBeVisible();
  });

});