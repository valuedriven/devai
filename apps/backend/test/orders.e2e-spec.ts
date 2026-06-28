import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { ClerkService } from './../src/core/auth/clerk.service';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    (BigInt.prototype as any).toJSON = function (this: bigint) {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClerkService)
      .useValue({
        verifyToken: jest.fn().mockImplementation(async (token) => {
          if (token === 'admin-token') return { sub: 'admin-id' };
          if (token === 'customer-token') return { sub: 'customer-id' };
          if (token === 'other-customer-token') return { sub: 'other-id' };
          throw new Error('Invalid token');
        }),
        getUser: jest.fn().mockImplementation(async (id) => {
          if (id === 'admin-id')
            return {
              id,
              publicMetadata: { roles: ['admin'] },
              emailAddresses: [{ emailAddress: 'admin@e2e.com' }],
            };
          if (id === 'customer-id')
            return {
              id,
              publicMetadata: { roles: ['customer'] },
              emailAddresses: [{ emailAddress: 'customer@e2e.com' }],
            };
          if (id === 'other-id')
            return {
              id,
              publicMetadata: { roles: ['customer'] },
              emailAddresses: [{ emailAddress: 'other@e2e.com' }],
            };
          return null;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  async function cleanDatabase() {
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.customer.deleteMany({});
  }

  async function seedCustomer(email: string) {
    return prisma.customer.create({
      data: {
        name: email.split('@')[0],
        email,
        active: true,
      },
    });
  }

  async function seedProduct(
    name: string,
    overrides: Partial<{
      stock: number;
      active: boolean;
      price: number;
    }> = {},
  ) {
    const category = await prisma.category.create({
      data: {
        name: `Category ${Date.now()}`,
        nameNormalized: `category ${Date.now()}`,
        slug: `category-${Date.now()}`,
        active: true,
      },
    });

    return prisma.product.create({
      data: {
        name,
        description: 'Test product',
        price: overrides.price ?? 100,
        stock: overrides.stock ?? 10,
        active: overrides.active ?? true,
        categoryId: category.id,
      },
    });
  }

  describe('POST /api/v1/orders', () => {
    it('should create an order for an authenticated customer', async () => {
      const customer = await seedCustomer('customer@e2e.com');
      const product = await seedProduct('In Stock Product', { stock: 5 });

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer customer-token')
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 2 }],
        })
        .expect(201);

      expect(response.body.status).toBe('Novo');
      expect(response.body.customerId).toBe(customer.id);
      expect(response.body.orderItems).toHaveLength(1);
      expect(Number(response.body.totalAmount)).toBe(200);

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updatedProduct?.stock).toBe(3);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const product = await seedProduct('Any Product');

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 1 }],
        })
        .expect(401);
    });

    it('should return 422 when stock is insufficient', async () => {
      await seedCustomer('customer@e2e.com');
      const product = await seedProduct('Low Stock Product', { stock: 1 });

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer customer-token')
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 5 }],
        })
        .expect(422);

      const unchangedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(unchangedProduct?.stock).toBe(1);
    });

    it('should reject order with inactive product', async () => {
      await seedCustomer('customer@e2e.com');
      const product = await seedProduct('Inactive Product', {
        stock: 10,
        active: false,
      });

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer customer-token')
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 1 }],
        })
        .expect(400);
    });

    it('should reject empty order', async () => {
      await seedCustomer('customer@e2e.com');

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer customer-token')
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [],
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should list only orders belonging to the authenticated customer', async () => {
      const customer = await seedCustomer('customer@e2e.com');
      const otherCustomer = await seedCustomer('other@e2e.com');
      const product = await seedProduct('List Product');

      await prisma.order.create({
        data: {
          number: `ORD-LIST-1-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua A',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });

      await prisma.order.create({
        data: {
          number: `ORD-LIST-2-${Date.now()}`,
          customerId: otherCustomer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua B',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer customer-token')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerId).toBe(customer.id);
    });

    it('should filter orders by status', async () => {
      const customer = await seedCustomer('customer@e2e.com');
      const product = await seedProduct('Filter Product');

      await prisma.order.create({
        data: {
          number: `ORD-FILTER-1-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua A',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });

      await prisma.order.create({
        data: {
          number: `ORD-FILTER-2-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Cancelado',
          shippingAddress: 'Rua B',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/orders?status=Novo')
        .set('Authorization', 'Bearer customer-token')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('Novo');
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return 404 when accessing another customers order', async () => {
      await seedCustomer('customer@e2e.com');
      const otherCustomer = await seedCustomer('other@e2e.com');
      const product = await seedProduct('Detail Product');

      const order = await prisma.order.create({
        data: {
          number: `ORD-DETAIL-${Date.now()}`,
          customerId: otherCustomer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua Outro',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/orders/${order.id}`)
        .set('Authorization', 'Bearer customer-token')
        .expect(404);
    });
  });

  describe('POST /api/v1/orders/:id/cancel', () => {
    it('should cancel an unpaid order and restore stock', async () => {
      const customer = await seedCustomer('customer@e2e.com');
      const product = await seedProduct('Cancel Product', { stock: 5 });

      const order = await prisma.order.create({
        data: {
          number: `ORD-CANCEL-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 200,
          status: 'Novo',
          shippingAddress: 'Rua Cancel',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 2,
              unitPrice: 100,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders/${order.id}/cancel`)
        .set('Authorization', 'Bearer customer-token')
        .expect(201);

      expect(response.body.status).toBe('Cancelado');

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updatedProduct?.stock).toBe(7);
    });

    it('should reject cancelling a paid order', async () => {
      const customer = await seedCustomer('customer@e2e.com');
      const product = await seedProduct('Paid Product', { stock: 5 });

      const order = await prisma.order.create({
        data: {
          number: `ORD-PAID-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Pago',
          shippingAddress: 'Rua Pago',
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/orders/${order.id}/cancel`)
        .set('Authorization', 'Bearer customer-token')
        .expect(400);
    });
  });
});
