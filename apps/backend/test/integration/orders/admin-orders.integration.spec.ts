import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../helpers/app';
import {
  createMockClerkService,
  adminAuthHeader,
  customerAuthHeader,
} from '../helpers/auth';
import { ClerkService } from '../../../src/core/auth/clerk.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { truncateAll } from '../helpers/database';
import { OrderStatus } from '../../../src/modules/orders/services/order-management.service';
import { PaymentStatus } from '../../../src/modules/orders/services/payment.service';

describe('Admin Orders (integration)', () => {
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

  async function createTestOrder() {
    const customer = await prisma.customer.create({
      data: { name: 'Admin Order Customer', email: 'admin-order@test.com' },
    });

    const product = await prisma.product.create({
      data: { name: 'Admin Order Product', price: 100, stock: 10 },
    });

    const order = await prisma.order.create({
      data: {
        number: `ORD-ADMIN-${Date.now()}`,
        customerId: customer.id,
        totalAmount: 100,
        status: OrderStatus.NEW,
        orderItems: {
          create: { productId: product.id, quantity: 1, unitPrice: 100 },
        },
      },
    });

    return { order, customer, product };
  }

  describe('GET /api/v1/admin/orders', () => {
    it('lists orders for admin', async () => {
      await createTestOrder();

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('returns 401 without auth header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .expect(401);
    });

    it('returns 403 for customer role', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set(customerAuthHeader())
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/orders/:id', () => {
    it('returns order details with customer, items, and payments', async () => {
      const { order } = await createTestOrder();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${order.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as { id: string };
      expect(body.id).toBe(order.id);
      expect(body).toHaveProperty('customer');
      expect(body).toHaveProperty('orderItems');
      expect(body).toHaveProperty('payments');
      expect(body).toHaveProperty('auditLogs');
    });

    it('returns 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 404 });
        });
    });
  });

  describe('PATCH /api/v1/admin/orders/:id/status', () => {
    it('transitions order from New to Paid', async () => {
      const { order } = await createTestOrder();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${order.id}/status`)
        .set(adminAuthHeader)
        .send({ status: OrderStatus.PAID })
        .expect(200);

      const body = response.body as { status: string };
      expect(body.status).toBe(OrderStatus.PAID);
    });

    it('returns 422 for invalid transition (New -> Shipped)', async () => {
      const { order } = await createTestOrder();

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${order.id}/status`)
        .set(adminAuthHeader)
        .send({ status: OrderStatus.SHIPPED })
        .expect(422)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 422 });
        });
    });
  });

  describe('POST /api/v1/admin/orders/:id/payments', () => {
    it('registers a confirmed payment and auto-transitions order to Paid', async () => {
      const { order } = await createTestOrder();

      await request(app.getHttpServer())
        .post(`/api/v1/admin/orders/${order.id}/payments`)
        .set(adminAuthHeader)
        .send({
          value: 100,
          method: 'Credit Card',
          date: new Date().toISOString(),
          status: PaymentStatus.CONFIRMED,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${order.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as {
        status: string;
        payments: Array<{ status: string }>;
      };
      expect(body.status).toBe(OrderStatus.PAID);
      expect(body.payments).toHaveLength(1);
      expect(body.payments[0].status).toBe(PaymentStatus.CONFIRMED);
    });
  });

  describe('Audit log', () => {
    it('creates audit entries for status transitions', async () => {
      const { order } = await createTestOrder();

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${order.id}/status`)
        .set(adminAuthHeader)
        .send({ status: OrderStatus.PAID, notes: 'Processing payment' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${order.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as {
        auditLogs: Array<{
          action: string;
          payload?: { to?: string; notes?: string };
        }>;
      };
      const statusChangeAudit = body.auditLogs.find(
        (log) =>
          log.action === 'STATUS_CHANGE' &&
          log.payload?.to === OrderStatus.PAID,
      );
      expect(statusChangeAudit).toBeDefined();
      expect(statusChangeAudit?.payload?.notes).toBe('Processing payment');
    });
  });
});
