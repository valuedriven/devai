import { faker as globalFaker } from '@faker-js/faker';

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

export interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

export const makeCategory = (faker = globalFaker): CategoryData => ({
  name: `${faker.commerce.department()} ${faker.string.alphanumeric(6)}`,
});

export const makeProduct = (categoryId: string, stock?: number, faker = globalFaker): ProductData => ({
  name: `${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
  price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
  stock: stock ?? faker.number.int({ min: 1, max: 100 }),
  categoryId,
  active: true,
  description: faker.commerce.productDescription(),
});

export const makeCustomer = (faker = globalFaker): CustomerData => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number({ style: 'national' }),
  address: faker.location.streetAddress(),
  active: true,
});

