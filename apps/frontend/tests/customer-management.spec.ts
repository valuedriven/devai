import { test, expect } from './fixtures/baseTest';
import { createCustomerApi, createOrderApi, createProduct, deleteProduct, SeededCustomer, SeededProduct } from './utils/api';
import { makeCustomer, makeProduct, makeOrder, makeOrderItem } from './utils/data';

test.describe('Customer Management', () => {

  test('Admin can create a customer successfully', async ({ page, customerPage, toastComponent, faker }) => {
    const cust = makeCustomer(faker);
    const custName = cust.name;
    const custEmail = cust.email;

    await test.step('navigate to customers list', async () => {
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('open new customer form', async () => {
      await customerPage.clickNewCustomer();
      await expect(customerPage.heading.filter({ hasText: 'Novo Cliente' })).toBeVisible();
    });

    await test.step('fill customer details', async () => {
      await customerPage.fillCustomerDetails(
        custName,
        custEmail,
        cust.phone || '11999999999',
        cust.address || 'Rua de Teste, 123'
      );
    });

    await test.step('submit form and verify success toast & redirect', async () => {
      await customerPage.submitForm();
      // Expect toast success message
      await expect(toastComponent.message('Cliente cadastrado com sucesso!')).toBeVisible();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
      await expect(customerPage.table.getByText(custName)).toBeVisible();
    });
  });

  test('Admin can edit a customer', async ({ page, request, authToken, customerPage, toastComponent, faker }) => {
    const editName = makeCustomer(faker).name;
    let customer: SeededCustomer;

    await test.step('seed customer via API', async () => {
      customer = await createCustomerApi(request, authToken, makeCustomer(faker));
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('edit customer name and save', async () => {
      await customerPage.editCustomer(customer.name, editName);
    });

    await test.step('verify success toast and update in list', async () => {
      await expect(toastComponent.message('Cliente atualizado com sucesso!')).toBeVisible();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
      await expect(customerPage.table.getByText(editName)).toBeVisible();
    });
  });

  test('Admin can soft delete a customer', async ({ request, authToken, customerPage, toastComponent, faker }) => {
    let customer: SeededCustomer;

    await test.step('seed customer via API', async () => {
      customer = await createCustomerApi(request, authToken, makeCustomer(faker));
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('delete the customer and confirm', async () => {
      await customerPage.deleteCustomer(customer.name);
      await expect(customerPage.dialog).toBeHidden();
    });

    await test.step('verify success toast and customer is Inactive in list', async () => {
      await expect(toastComponent.message('Item excluído com sucesso!')).toBeVisible();
      const row = customerPage.rowFor(customer.name);
      await expect(row.getByText('Inativo')).toBeVisible();
    });
  });

  test('Cannot delete a customer that has associated orders', async ({ request, authToken, customerPage, seededCustomer, seededProduct, toastComponent, faker }) => {
    await test.step('seed an order for the customer via API', async () => {
      await createOrderApi(request, authToken, makeOrder(seededCustomer.id, [makeOrderItem(seededProduct.id, 1, seededProduct.price)]), faker);
    });

    await test.step('navigate to customers list', async () => {
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('attempt to delete the customer and verify error toast', async () => {
      await customerPage.deleteCustomer(seededCustomer.name);
      await expect(
        toastComponent.message(/possui pedidos associados|não é possível excluir/i),
      ).toBeVisible();
    });
  });

  test('Admin can list and search customers', async ({ page, request, authToken, customerPage, faker }) => {
    const searchTarget = makeCustomer(faker);
    const otherTarget = makeCustomer(faker);
    const nameMatch = searchTarget.name;
    const otherName = otherTarget.name;
    
    await test.step('seed search target and other customer via API', async () => {
      await createCustomerApi(request, authToken, searchTarget);
      await createCustomerApi(request, authToken, otherTarget);
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('search for unique name and verify list filters correctly', async () => {
      await customerPage.searchInput.fill(nameMatch);
      
      await expect(customerPage.table.getByText(nameMatch)).toBeVisible();
      await expect(customerPage.table.getByText(otherName)).toBeHidden();
    });
  });

  test('Admin can view details of a specific customer by ID', async ({ page, request, authToken, customerPage, faker }) => {
    const cust = makeCustomer(faker);
    const customerData = {
      name: cust.name,
      email: cust.email,
      phone: cust.phone || '11988888888',
      address: cust.address || 'Rua das Laranjeiras, 456',
    };
    let customer: SeededCustomer;

    await test.step('seed customer via API', async () => {
      customer = await createCustomerApi(request, authToken, customerData);
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('navigate to edit details page and verify pre-populated values', async () => {
      await customerPage.rowFor(customer.name).getByTitle('Editar').click();
      await expect(customerPage.heading.filter({ hasText: 'Editar Cliente' })).toBeVisible();
      
      await expect(customerPage.nameInput).toHaveValue(customerData.name);
      await expect(customerPage.emailInput).toHaveValue(customerData.email);
      await expect(customerPage.phoneInput).toHaveValue(customerData.phone);
      await expect(customerPage.addressInput).toHaveValue(customerData.address);
    });
  });

  test('Block duplicate emails on creation', async ({ request, authToken, customerPage, toastComponent, faker }) => {
    const targetCust = makeCustomer(faker);
    const email = targetCust.email;

    await test.step('seed customer with target email via API', async () => {
      await createCustomerApi(request, authToken, targetCust);
      await customerPage.goTo();
      await expect(customerPage.heading.filter({ hasText: 'Clientes' })).toBeVisible();
    });

    await test.step('open new customer form', async () => {
      await customerPage.clickNewCustomer();
      await expect(customerPage.heading.filter({ hasText: 'Novo Cliente' })).toBeVisible();
    });

    await test.step('attempt to create customer with duplicate email', async () => {
      await customerPage.fillCustomerDetails(
        faker.person.fullName(),
        email,
        faker.phone.number({ style: 'national' }),
        faker.location.streetAddress()
      );
      await customerPage.submitForm();
    });

    await test.step('verify conflict error toast and that page did not redirect', async () => {
      await expect(toastComponent.message('Erro ao salvar cliente.')).toBeVisible();
      await expect(customerPage.heading.filter({ hasText: 'Novo Cliente' })).toBeVisible();
    });
  });

  test('Non-admin user cannot access /admin/customers', async ({ page, loginPage, storefrontPage, forbiddenPage }) => {
    await test.step('log out from admin session', async () => {
      await page.context().clearCookies();
      await storefrontPage.goTo();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    await test.step('log in as non-admin user', async () => {
      await loginPage.goTo();
      await loginPage.login(
        process.env.CUSTOMER_EMAIL!,
        process.env.CUSTOMER_PASSWORD!
      );
      await expect(storefrontPage.welcomeHeading).toBeVisible();
    });

    await test.step('attempt to access admin customers page and verify 403', async () => {
      await page.goto('/admin/customers');
      await expect(forbiddenPage.code).toBeVisible();
    });
  });

});
