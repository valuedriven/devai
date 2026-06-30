import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../helpers/app';
import { createMockClerkService, customerAuthHeader } from '../helpers/auth';
import { ClerkService } from '../../../src/core/auth/clerk.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { truncateAll } from '../helpers/database';

describe('Orders (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp([
      { provide: ClerkService, useValue: createMockClerkService() },
    ]);
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  async function seedCustomer(email = 'customer@test.com') {
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
        name: `Cat-${Date.now()}`,
        nameNormalized: `cat-${Date.now()}`,
        slug: `cat-${Date.now()}`,
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
    it('creates an order for authenticated customer and decrements stock', async () => {
      await seedCustomer('customer@test.com');
      const product = await seedProduct('In Stock Product', { stock: 5 });

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(customerAuthHeader())
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 2 }],
        })
        .expect(201);

      const body = response.body as {
        status: string;
        orderItems: unknown[];
        totalAmount: number;
      };
      expect(body.status).toBe('Novo');
      expect(body.orderItems).toHaveLength(1);
      expect(Number(body.totalAmount)).toBe(200);

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updatedProduct?.stock).toBe(3);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const product = await seedProduct('Any Product');

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 1 }],
        })
        .expect(401);
    });

    it('returns 422 when stock is insufficient', async () => {
      await seedCustomer('customer@test.com');
      const product = await seedProduct('Low Stock Product', { stock: 1 });

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(customerAuthHeader())
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 5 }],
        })
        .expect(422);

      const body = response.body as {
        type: string;
        status: number;
        detail: string;
      };
      expect(body).toMatchObject({
        type: expect.any(String) as string,
        status: 422,
        detail: expect.stringContaining('Insufficient stock') as string,
      });

      const unchanged = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(unchanged?.stock).toBe(1);
    });

    it('returns 400 for inactive product', async () => {
      await seedCustomer('customer@test.com');
      const product = await seedProduct('Inactive Product', {
        stock: 10,
        active: false,
      });

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(customerAuthHeader())
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [{ productId: product.id, quantity: 1 }],
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 400 });
        });
    });

    it('returns 400 for empty order', async () => {
      await seedCustomer('customer@test.com');

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(customerAuthHeader())
        .send({
          shippingAddress: 'Rua Teste, 123',
          order_items: [],
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('lists only orders belonging to the authenticated customer', async () => {
      const customer = await seedCustomer('customer@test.com');
      const otherCustomer = await seedCustomer('other@test.com');
      const product = await seedProduct('List Product');

      await prisma.order.create({
        data: {
          number: `ORD-LIST-1-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua A',
          orderItems: {
            create: { productId: product.id, quantity: 1, unitPrice: 100 },
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
            create: { productId: product.id, quantity: 1, unitPrice: 100 },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set(customerAuthHeader())
        .expect(200);

      const body = response.body as { data: unknown[]; total: number };
      expect(body).toMatchObject({
        data: expect.any(Array) as unknown[],
        total: expect.any(Number) as number,
      });
      expect(body.data).toHaveLength(1);
    });

    it('filters orders by status', async () => {
      const customer = await seedCustomer('customer@test.com');
      const product = await seedProduct('Filter Product');

      await prisma.order.create({
        data: {
          number: `ORD-FILTER-1-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua A',
          orderItems: {
            create: { productId: product.id, quantity: 1, unitPrice: 100 },
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
            create: { productId: product.id, quantity: 1, unitPrice: 100 },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/orders?status=Novo')
        .set(customerAuthHeader())
        .expect(200);

      const body = response.body as { data: Array<{ status: string }> };
      expect(body.data).toHaveLength(1);
      expect(body.data[0].status).toBe('Novo');
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('returns 404 when accessing another customers order (IDOR)', async () => {
      await seedCustomer('customer@test.com');
      const otherCustomer = await seedCustomer('other@test.com');
      const product = await seedProduct('Detail Product');

      const order = await prisma.order.create({
        data: {
          number: `ORD-DETAIL-${Date.now()}`,
          customerId: otherCustomer.id,
          totalAmount: 100,
          status: 'Novo',
          shippingAddress: 'Rua Outro',
          orderItems: {
            create: { productId: product.id, quantity: 1, unitPrice: 100 },
          },
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/orders/${order.id}`)
        .set(customerAuthHeader())
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 404 });
        });
    });

    it('returns 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders/00000000-0000-0000-0000-000000000000')
        .set(customerAuthHeader())
        .expect(404);
    });
  });

  describe('POST /api/v1/orders/:id/cancel', () => {
    it('cancels an unpaid order and restores stock', async () => {
      const customer = await seedCustomer('customer@test.com');
      const product = await seedProduct('Cancel Product', { stock: 5 });

      const order = await prisma.order.create({
        data: {
          number: `ORD-CANCEL-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 200,
          status: 'Novo',
          shippingAddress: 'Rua Cancel',
          orderItems: {
            create: { productId: product.id, quantity: 2, unitPrice: 100 },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders/${order.id}/cancel`)
        .set(customerAuthHeader())
        .expect(201);

      const body = response.body as { status: string };
      expect(body.status).toBe('Cancelado');

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updatedProduct?.stock).toBe(7);
    });

    it('rejects cancelling a paid order', async () => {
      const customer = await seedCustomer('customer@test.com');
      const product = await seedProduct('Paid Product', { stock: 5 });

      const order = await prisma.order.create({
        data: {
          number: `ORD-PAID-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 100,
          status: 'Pago',
          shippingAddress: 'Rua Pago',
          orderItems: {
            create: { productId: product.id, quantity: 1, unitPrice: 100 },
          },
        },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/orders/${order.id}/cancel`)
        .set(customerAuthHeader())
        .expect(400)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 400 });
        });
    });
  });
});
