export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

export type OrderStatus = 'Novo' | 'Pago' | 'Preparação' | 'Faturado' | 'Despachado' | 'Entregue' | 'Cancelado';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  customerId: string;
  items: OrderItem[];
}

export const categories: Category[] = [
  { id: '1', name: 'Eletrônicos', active: true },
  { id: '2', name: 'Vestuário', active: true },
  { id: '3', name: 'Casa', active: true },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Smartphone X',
    description: 'Smartphone de última geração com câmera de alta resolução.',
    price: 2999.00,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    stock: 50,
    categoryId: '1',
    active: true,
  },
  {
    id: '2',
    name: 'Notebook Pro',
    description: 'Notebook potente para trabalho e jogos.',
    price: 5499.00,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
    stock: 20,
    categoryId: '1',
    active: true,
  },
  {
    id: '3',
    name: 'Camiseta Devia',
    description: 'Camiseta confortável de algodão.',
    price: 89.90,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    stock: 100,
    categoryId: '2',
    active: true,
  },
  {
    id: '4',
    name: 'Sofá Moderno',
    description: 'Sofá de 3 lugares com design contemporâneo.',
    price: 1899.00,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    stock: 5,
    categoryId: '3',
    active: true,
  },
];

export const customers: Customer[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    active: true,
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@example.com',
    phone: '(21) 98888-8888',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    active: true,
  },
];

export const orders: Order[] = [
  {
    id: '1001',
    date: '2023-10-25T14:00:00Z',
    total: 3088.90,
    status: 'Entregue',
    customerId: '1',
    items: [
      { productId: '1', quantity: 1, unitPrice: 2999.00 },
      { productId: '3', quantity: 1, unitPrice: 89.90 },
    ],
  },
  {
    id: '1002',
    date: '2023-10-26T10:30:00Z',
    total: 5499.00,
    status: 'Pago',
    customerId: '2',
    items: [
      { productId: '2', quantity: 1, unitPrice: 5499.00 },
    ],
  },
  {
    id: '1003',
    date: '2023-10-27T16:45:00Z',
    total: 1899.00,
    status: 'Novo',
    customerId: '1',
    items: [
      { productId: '4', quantity: 1, unitPrice: 1899.00 },
    ],
  },
];
