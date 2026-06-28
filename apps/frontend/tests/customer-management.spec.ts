import { test, expect } from './fixtures/baseTest';
import { createCustomerApi, createOrderApi, createProduct, deleteProduct, SeededCustomer, SeededProduct } from './utils/api';
import { makeCustomer, makeProduct } from './utils/data';

test.describe('Customer Management', () => {

  test('Admin can create a customer successfully', async ({ page, customerPage }) => {
    const custName = `Cliente Teste ${Date.now()}`;
    const custEmail = `cliente-${Date.now()}@example.com`;

    await test.step('navigate to customers list', async () => {
      await customerPage.goto();
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
    });

    await test.step('open new customer form', async () => {
      await customerPage.clickNewCustomer();
      await expect(page.locator('h1', { hasText: 'Novo Cliente' })).toBeVisible();
    });

    await test.step('fill customer details', async () => {
      await customerPage.fillCustomerDetails(
        custName,
        custEmail,
        '11999999999',
        'Rua de Teste, 123'
      );
    });

    await test.step('submit form and verify success toast & redirect', async () => {
      await customerPage.submitForm();
      // Expect toast success message
      await expect(page.getByText('Cliente cadastrado com sucesso!')).toBeVisible({ timeout: 10000 });
      await page.waitForURL('**/admin/customers', { timeout: 15000 });
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
      await expect(page.locator('table').getByText(custName)).toBeVisible();
    });
  });

  test('Admin can edit a customer', async ({ page, request, authToken, customerPage }) => {
    const editName = `Cliente Editado ${Date.now()}`;
    let customer: SeededCustomer;

    await test.step('seed customer via API', async () => {
      customer = await createCustomerApi(request, authToken, makeCustomer());
      await customerPage.goto();
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
    });

    await test.step('edit customer name and save', async () => {
      await customerPage.editCustomer(customer.name, editName);
    });

    await test.step('verify success toast and update in list', async () => {
      await expect(page.getByText('Cliente atualizado com sucesso!')).toBeVisible({ timeout: 10000 });
      await page.waitForURL('**/admin/customers', { timeout: 15000 });
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
      await expect(page.locator('table').getByText(editName)).toBeVisible();
    });
  });

  test('Admin can soft delete a customer', async ({ page, request, authToken, customerPage }) => {
    let customer: SeededCustomer;

    await test.step('seed customer via API', async () => {
      customer = await createCustomerApi(request, authToken, makeCustomer());
      await customerPage.goto();
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
    });

    await test.step('delete the customer and confirm', async () => {
      await customerPage.deleteCustomer(customer.name);
      await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
    });

    await test.step('verify success toast and customer is Inactive in list', async () => {
      await expect(page.getByText('Item excluído com sucesso!')).toBeVisible({ timeout: 10000 });
      const row = page.locator('tr', { hasText: customer.name });
      await expect(row.getByText('Inativo')).toBeVisible();
    });
  });

  test('Cannot delete a customer that has associated orders', async ({ page, request, authToken, customerPage, seededCategory }) => {
    let customer: SeededCustomer;
    let product: SeededProduct;

    await test.step('seed customer and product via API', async () => {
      customer = await createCustomerApi(request, authToken, makeCustomer());
      product = await createProduct(request, authToken, makeProduct(seededCategory.id));
    });

    try {
      await test.step('seed an order for the customer via API', async () => {
        await createOrderApi(request, authToken, {
          customerId: customer.id,
          totalAmount: 10.0,
          order_items: [{ productId: product.id, quantity: 1 }],
        });
      });

      await test.step('navigate to customers list', async () => {
        await customerPage.goto();
        await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
      });

      await test.step('attempt to delete the customer and verify error toast', async () => {
        await customerPage.deleteCustomer(customer.name);
        await expect(
          page.getByText(/possui pedidos associados|não é possível excluir/i),
        ).toBeVisible({ timeout: 10000 });
      });
    } finally {
      await test.step('cleanup seeded product', async () => {
        await deleteProduct(request, authToken, product?.id);
      });
    }
  });

  test('Admin can list and search customers', async ({ page, request, authToken, customerPage }) => {
    const searchSuffix = Date.now().toString();
    const nameMatch = `UniqSearchName_${searchSuffix}`;
    const otherName = `OtherCust_${searchSuffix}`;
    
    await test.step('seed search target and other customer via API', async () => {
      await createCustomerApi(request, authToken, {
        ...makeCustomer(),
        name: nameMatch,
        email: `search-${searchSuffix}@example.com`,
      });
      await createCustomerApi(request, authToken, {
        ...makeCustomer(),
        name: otherName,
        email: `other-${searchSuffix}@example.com`,
      });
      await customerPage.goto();
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
    });

    await test.step('search for unique name and verify list filters correctly', async () => {
      const searchInput = page.getByPlaceholder('Pesquisar clientes...');
      await searchInput.fill(nameMatch);
      // Wait for search query URL param to update
      await page.waitForURL(new RegExp(`search=${nameMatch}`), { timeout: 10000 });
      
      await expect(page.locator('table').getByText(nameMatch)).toBeVisible();
      await expect(page.locator('table').getByText(otherName)).toBeHidden();
    });
  });

  test('Admin can view details of a specific customer by ID', async ({ page, request, authToken, customerPage }) => {
    const uniqueSuffix = Date.now().toString();
    const customerData = {
      name: `ViewDetailName_${uniqueSuffix}`,
      email: `view-${uniqueSuffix}@example.com`,
      phone: '11988888888',
      address: 'Rua das Laranjeiras, 456',
    };
    let customer: SeededCustomer;

    await test.step('seed customer via API', async () => {
      customer = await createCustomerApi(request, authToken, customerData);
      await customerPage.goto();
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
    });

    await test.step('navigate to edit details page and verify pre-populated values', async () => {
      await page.locator('tr', { hasText: customer.name }).getByTitle('Editar').click();
      await page.waitForURL(`**/admin/customers/${customer.id}/edit`, { timeout: 10000 });
      await expect(page.locator('h1', { hasText: 'Editar Cliente' })).toBeVisible();
      
      await expect(customerPage.nameInput).toHaveValue(customerData.name);
      await expect(customerPage.emailInput).toHaveValue(customerData.email);
      await expect(customerPage.phoneInput).toHaveValue(customerData.phone);
      await expect(customerPage.addressInput).toHaveValue(customerData.address);
    });
  });

  test('Block duplicate emails on creation', async ({ page, request, authToken, customerPage }) => {
    const email = `duplicate-${Date.now()}@example.com`;

    await test.step('seed customer with target email via API', async () => {
      await createCustomerApi(request, authToken, {
        ...makeCustomer(),
        email,
      });
      await customerPage.goto();
      await expect(page.locator('h1', { hasText: 'Clientes' }).first()).toBeVisible();
    });

    await test.step('open new customer form', async () => {
      await customerPage.clickNewCustomer();
      await expect(page.locator('h1', { hasText: 'Novo Cliente' })).toBeVisible();
    });

    await test.step('attempt to create customer with duplicate email', async () => {
      await customerPage.fillCustomerDetails(
        'Duplicate Name',
        email,
        '11999999999',
        'Address 123'
      );
      await customerPage.submitForm();
    });

    await test.step('verify conflict error toast and that page did not redirect', async () => {
      await expect(page.getByText('Erro ao salvar cliente.')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('h1', { hasText: 'Novo Cliente' })).toBeVisible();
    });
  });

  test('Non-admin user cannot access /admin/customers', async ({ page, loginPage, customerPage }) => {
    await test.step('log out from admin session', async () => {
      await page.context().clearCookies();
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('log in as non-admin user', async () => {
      await loginPage.goto();
      await loginPage.login(
        process.env.CUSTOMER_EMAIL || 'jps012009@yahoo.com.br',
        process.env.CUSTOMER_PASSWORD || 'jps012009@yahoo.com.br'
      );
      await page.waitForURL('/');
    });

    await test.step('attempt to access admin customers page and verify 403', async () => {
      await customerPage.goto();
      await expect(page.getByText(/403/i)).toBeVisible({ timeout: 5000 });
    });
  });

});
