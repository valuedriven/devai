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
import { OrderStatus } from './../src/modules/orders/services/order-management.service';
import { PaymentStatus } from './../src/modules/orders/services/payment.service';

describe('Admin Orders (e2e)', () => {
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
          if (token === 'user-token') return { sub: 'user-id' };
          throw new Error('Invalid token');
        }),
        getUser: jest.fn().mockImplementation(async (id) => {
          if (id === 'admin-id')
            return {
              id,
              publicMetadata: { roles: ['admin'] },
              emailAddresses: [{ emailAddress: 'admin@e2e.com' }],
            };
          return {
            id,
            publicMetadata: { roles: [] },
            emailAddresses: [{ emailAddress: 'user@e2e.com' }],
          };
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

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  async function cleanDatabase() {
    await prisma.auditLog.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customer.deleteMany({});
  }

  describe('Order Lifecycle', () => {
    let orderId: string;
    let customerId: string;

    beforeAll(async () => {
      const customer = await prisma.customer.create({
        data: { name: 'E2E Customer', email: 'e2e@example.com' },
      });
      customerId = customer.id;

      const product = await prisma.product.create({
        data: { name: 'E2E Product', price: 100, stock: 10 },
      });

      const order = await prisma.order.create({
        data: {
          number: 'ORD-E2E-1',
          customerId: customerId,
          totalAmount: 100,
          status: OrderStatus.NEW,
          orderItems: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100,
            },
          },
        },
      });
      orderId = order.id;
    });

    it('should list orders for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get order details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${orderId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.id).toBe(orderId);
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('orderItems');
      expect(response.body).toHaveProperty('payments');
      expect(response.body).toHaveProperty('auditLogs');
    });

    it('should fail to transition to invalid state (New -> Shipped)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', 'Bearer admin-token')
        .send({ status: OrderStatus.SHIPPED })
        .expect(422);
    });

    it('should register a confirmed payment and auto-transition to Paid', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/admin/orders/${orderId}/payments`)
        .set('Authorization', 'Bearer admin-token')
        .send({
          value: 100,
          method: 'Credit Card',
          date: new Date().toISOString(),
          status: PaymentStatus.CONFIRMED,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${orderId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.PAID);
      expect(response.body.payments.length).toBe(1);
      expect(response.body.payments[0].status).toBe(PaymentStatus.CONFIRMED);
    });

    it('should transition from Paid to Preparation', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', 'Bearer admin-token')
        .send({ status: OrderStatus.PREPARATION, notes: 'Starting prep' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${orderId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.PREPARATION);
      // Check audit log
      const statusChangeAudit = response.body.auditLogs.find(
        (log: any) =>
          log.action === 'STATUS_CHANGE' &&
          log.payload.to === OrderStatus.PREPARATION,
      );
      expect(statusChangeAudit).toBeDefined();
      expect(statusChangeAudit.payload.notes).toBe('Starting prep');
    });
  });
});
