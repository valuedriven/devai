/**
 * Data factories for E2E test seeding.
 * Uses Date.now() + Math.random() for uniqueness across parallel workers.
 */

const uid = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export interface CategoryData {
  name: string;
}

export interface ProductData {
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  active: boolean;
  description?: string;
}

export const makeCategory = (): CategoryData => ({
  name: `Cat E2E ${uid()}`,
});

export const makeProduct = (categoryId: string, stock?: number): ProductData => ({
  name: `Prod E2E ${uid()}`,
  price: 99.99,
  stock: stock ?? 10,
  categoryId,
  active: true,
  description: 'Produto criado automaticamente para testes E2E',
});

export interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

export const makeCustomer = (): CustomerData => ({
  name: `Customer E2E ${uid()}`,
  email: `customer-${uid()}@example.com`,
  phone: '11999999999',
  address: 'Rua de Teste, 123',
  active: true,
});
