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

export const makeCategory = (faker = globalFaker): CategoryData => {
  const uniq = Math.random().toString(36).substring(2, 7);
  return {
    name: `${faker.commerce.department()} ${faker.string.alphanumeric(6)}-${uniq}`,
  };
};

export const makeProduct = (categoryId: string, stock?: number, faker = globalFaker): ProductData => {
  const uniq = Math.random().toString(36).substring(2, 7);
  return {
    name: `${faker.commerce.productName()} ${faker.string.alphanumeric(6)}-${uniq}`,
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    stock: stock ?? faker.number.int({ min: 1, max: 100 }),
    categoryId,
    active: true,
    description: faker.commerce.productDescription(),
  };
};

export const makeCustomer = (faker = globalFaker): CustomerData => {
  const uniq = Math.random().toString(36).substring(2, 7);
  const rawEmail = faker.internet.email();
  const [user, domain] = rawEmail.split('@');
  return {
    name: `${faker.person.fullName()}-${uniq}`,
    email: `${user}-${uniq}@${domain}`,
    phone: faker.phone.number({ style: 'national' }),
    address: faker.location.streetAddress(),
    active: true,
  };
};

export interface OrderItemData {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface OrderData {
  customerId: string;
  totalAmount: number;
  items: OrderItemData[];
}

export const makeOrderItem = (productId: string, quantity: number = 1, unitPrice?: number | string): OrderItemData => ({
  productId,
  quantity,
  ...(unitPrice !== undefined ? { unitPrice: Number(unitPrice) } : {}),
});

export const makeOrder = (customerId: string, items: OrderItemData[], totalAmount: number = 0): OrderData => ({
  customerId,
  totalAmount,
  items,
});

