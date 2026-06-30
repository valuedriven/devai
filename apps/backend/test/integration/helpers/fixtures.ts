export function makeCustomer(
  overrides: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    active: boolean;
  }> = {},
) {
  const ts = Date.now();
  return {
    name: `Customer-${ts}`,
    email: `customer-${ts}@test.com`,
    active: true,
    ...overrides,
  };
}

export function makeProduct(
  overrides: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    active: boolean;
    categoryId: string;
  }> = {},
) {
  const ts = Date.now();
  return {
    name: `Product-${ts}`,
    description: 'Test product',
    price: 99.99,
    stock: 10,
    active: true,
    ...overrides,
  };
}

export function makeCategory(
  overrides: Partial<{
    name: string;
    active: boolean;
  }> = {},
) {
  const ts = Date.now();
  return {
    name: `Category-${ts}`,
    ...overrides,
  };
}

export function makeOrder(
  overrides: Partial<{
    number: string;
    customerId: string;
    totalAmount: number;
    status: string;
    shippingAddress: string;
  }> = {},
) {
  const ts = Date.now();
  return {
    number: `ORD-${ts}`,
    totalAmount: 100,
    status: 'Novo',
    shippingAddress: 'Rua Teste, 123',
    ...overrides,
  };
}

export function makeOrderItem(
  overrides: Partial<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }> = {},
) {
  return {
    quantity: 1,
    unitPrice: 100,
    ...overrides,
  };
}
