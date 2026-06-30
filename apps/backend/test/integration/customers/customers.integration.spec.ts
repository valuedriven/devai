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
import { makeCustomer } from '../helpers/fixtures';

describe('Customers (integration)', () => {
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

  describe('POST /api/v1/customers', () => {
    it('creates a customer successfully (admin)', async () => {
      const data = makeCustomer();
      const response = await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set(adminAuthHeader)
        .send(data)
        .expect(201);

      const body = response.body as {
        id: string;
        name: string;
        email: string;
        active: boolean;
      };
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(data.name);
      expect(body.email).toBe(data.email);
      expect(body.active).toBe(true);

      const saved = await prisma.customer.findUnique({
        where: { id: body.id },
      });
      expect(saved).not.toBeNull();
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set(adminAuthHeader)
        .send({})
        .expect(400)
        .expect((res) => {
          const body = res.body as {
            type: string;
            title: string;
            status: number;
          };
          expect(body).toMatchObject({
            type: expect.any(String) as string,
            title: 'Bad Request',
            status: 400,
          });
        });
    });

    it('returns 409 when email already exists', async () => {
      const customer = await prisma.customer.create({
        data: makeCustomer(),
      });

      await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set(adminAuthHeader)
        .send({ name: 'Duplicate', email: customer.email })
        .expect(409)
        .expect((res) => {
          const body = res.body as { type: string; status: number };
          expect(body).toMatchObject({
            type: expect.any(String) as string,
            status: 409,
          });
        });
    });

    it('returns 401 without auth header', async () => {
      const data = makeCustomer();
      await request(app.getHttpServer())
        .post('/api/v1/customers')
        .send(data)
        .expect(401);
    });

    it('returns 403 for customer role', async () => {
      const data = makeCustomer();
      await request(app.getHttpServer())
        .post('/api/v1/customers')
        .set(customerAuthHeader())
        .send(data)
        .expect(403);
    });
  });

  describe('GET /api/v1/customers', () => {
    it('lists customers with optional search (admin)', async () => {
      await prisma.customer.create({
        data: makeCustomer({ name: 'Alpha Corp' }),
      });
      await prisma.customer.create({
        data: makeCustomer({ name: 'Beta Inc' }),
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/customers')
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as Array<{ name: string; active: boolean }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
    });

    it('filters by search term', async () => {
      await prisma.customer.create({
        data: makeCustomer({ name: 'Alpha Corp', email: 'alpha@test.com' }),
      });
      await prisma.customer.create({
        data: makeCustomer({ name: 'Beta Inc', email: 'beta@test.com' }),
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/customers?search=Alpha')
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as Array<{ name: string }>;
      expect(body.length).toBe(1);
      expect(body[0].name).toContain('Alpha');
    });

    it('returns 401 without auth header', async () => {
      await request(app.getHttpServer()).get('/api/v1/customers').expect(401);
    });

    it('returns 403 for customer role', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers')
        .set(customerAuthHeader())
        .expect(403);
    });
  });

  describe('GET /api/v1/customers/active', () => {
    it('lists only active customers', async () => {
      await prisma.customer.create({
        data: makeCustomer({ name: 'Active One' }),
      });
      await prisma.customer.create({
        data: makeCustomer({ name: 'Inactive One', active: false }),
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/customers/active')
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as Array<{ active: boolean }>;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].active).toBe(true);
    });
  });

  describe('GET /api/v1/customers/:id', () => {
    it('returns a customer by id', async () => {
      const customer = await prisma.customer.create({
        data: makeCustomer(),
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/customers/${customer.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as { id: string; email: string };
      expect(body.id).toBe(customer.id);
      expect(body.email).toBe(customer.email);
    });

    it('returns 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404)
        .expect((res) => {
          const body = res.body as { type: string; status: number };
          expect(body).toMatchObject({
            type: expect.any(String) as string,
            status: 404,
          });
        });
    });
  });

  describe('PATCH /api/v1/customers/:id', () => {
    it('updates a customer successfully', async () => {
      const customer = await prisma.customer.create({
        data: makeCustomer(),
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/customers/${customer.id}`)
        .set(adminAuthHeader)
        .send({ name: 'Updated Name' })
        .expect(200);

      const body = response.body as { name: string };
      expect(body.name).toBe('Updated Name');
    });

    it('returns 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .send({ name: 'Nope' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/customers/:id', () => {
    it('soft-deletes a customer successfully (200)', async () => {
      const customer = await prisma.customer.create({
        data: makeCustomer(),
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/customers/${customer.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const saved = await prisma.customer.findUnique({
        where: { id: customer.id },
      });
      expect(saved?.active).toBe(false);
    });

    it('returns 409 when deleting customer with orders', async () => {
      const customer = await prisma.customer.create({
        data: makeCustomer(),
      });
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 50,
          stock: 5,
        },
      });
      await prisma.order.create({
        data: {
          number: `ORD-DEL-${Date.now()}`,
          customerId: customer.id,
          totalAmount: 50,
          status: 'Novo',
          orderItems: {
            create: { productId: product.id, quantity: 1, unitPrice: 50 },
          },
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/customers/${customer.id}`)
        .set(adminAuthHeader)
        .expect(409)
        .expect((res) => {
          const body = res.body as { type: string; status: number };
          expect(body).toMatchObject({
            type: expect.any(String) as string,
            status: 409,
          });
        });
    });

    it('returns 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404);
    });
  });
});
