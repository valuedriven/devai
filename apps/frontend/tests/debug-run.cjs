/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function runTest() {
  const storageStatePath = path.resolve(__dirname, '.auth/admin.json');
  
  console.log('Storage state file:', storageStatePath);
  console.log('File exists:', fs.existsSync(storageStatePath));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: storageStatePath,
    baseURL: 'http://localhost:3000',
  });
  
  const page = await context.newPage();
  
  // Check cookies
  const cookies = await context.cookies();
  const authCookie = cookies.find(c => c.name === 'devai_auth_token');
  console.log('Auth cookie found:', !!authCookie);
  
  // Test 1: navigate to customers page
  console.log('Test 1: Navigate to admin customers page');
  const resp = await page.goto('/admin/customers', { waitUntil: 'load', timeout: 30000 });
  console.log('Response status:', resp?.status());
  console.log('URL:', page.url());
  
  const h1Visible = await page.locator('h1').filter({ hasText: 'Clientes' }).first().isVisible().catch(() => false);
  console.log('Clientes h1 visible:', h1Visible);
  
  if (!h1Visible) {
    const bodyText = await page.locator('body').innerText().catch(() => 'NO TEXT');
    console.log('Body preview:', bodyText.substring(0, 1500));
  }
  
  // Test 2: Check API seeding
  console.log('\nTest 2: Create customer via API');
  
  if (!authCookie) {
    console.log('ERROR: No auth cookie found');
  } else {
    console.log('Auth token first 20 chars:', authCookie.value.substring(0, 20) + '...');
    
    const res = await page.request.post('http://localhost:3001/api/v1/customers', {
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Test Customer ${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        phone: '11999999999',
        address: 'Rua de Teste, 123',
        active: true,
      },
    });
    
    console.log('Create customer status:', res.status());
    if (res.ok()) {
      const customer = await res.json();
      console.log('Created customer ID:', customer.id);
      
      // Test 3: Create order
      console.log('\nTest 3: Create order for customer');
      const orderRes = await page.request.post('http://localhost:3001/api/v1/orders', {
        headers: {
          Authorization: `Bearer ${authCookie.value}`,
          'Content-Type': 'application/json',
        },
        data: {
          customerId: customer.id,
          totalAmount: 10.0,
          number: `E2E-${Date.now()}`,
        },
      });
      console.log('Create order status:', orderRes.status());
      if (!orderRes.ok()) {
        const text = await orderRes.text();
        console.log('Order error:', text.substring(0, 400));
      } else {
        console.log('Order created successfully');
      }
      
      // Test 4: Soft delete the customer (should be blocked due to orders)
      console.log('\nTest 4: Delete customer with orders (expect 409)');
      const delRes = await page.request.delete(`http://localhost:3001/api/v1/customers/${customer.id}`, {
        headers: {
          Authorization: `Bearer ${authCookie.value}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Delete status:', delRes.status());
      if (delRes.status() === 409) {
        console.log('✓ Correct! Conflict error returned.');
      } else {
        const text = await delRes.text();
        console.log('Delete response:', text.substring(0, 200));
      }
    } else {
      const text = await res.text();
      console.log('Customer create error:', text.substring(0, 300));
    }
  }
  
  await browser.close();
  console.log('\nDone!');
}

runTest().catch(console.error);
