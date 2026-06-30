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

describe('Admin Products (integration)', () => {
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

  let categoryId: string;

  beforeEach(async () => {
    const cat = await prisma.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        nameNormalized: `test category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
        active: true,
      },
    });
    categoryId = cat.id;
  });

  describe('POST /api/v1/admin/products', () => {
    it('creates a product successfully (admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set(adminAuthHeader)
        .send({
          name: 'New Product',
          description: 'Fresh item',
          price: 150.5,
          stock: 20,
          categoryId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const body = response.body as { name: string; price: number };
      expect(body.name).toBe('New Product');
      expect(Number(body.price)).toBe(150.5);
    });

    it('returns 400 when price is negative', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set(adminAuthHeader)
        .send({
          name: 'Bad Price',
          price: -5,
          stock: 10,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 400 });
        });
    });

    it('returns 403 for non-admin users', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set(customerAuthHeader())
        .send({
          name: 'Block Me',
          price: 10,
          stock: 10,
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/products', () => {
    it('lists products with X-Total-Count header', async () => {
      await prisma.product.create({
        data: { name: 'Product A', price: 10, stock: 5, categoryId },
      });
      await prisma.product.create({
        data: { name: 'Product B', price: 20, stock: 3, categoryId },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/products')
        .set(adminAuthHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const body = response.body as Array<{ name: string }>;
      expect(body.length).toBe(2);
      expect(response.headers['x-total-count']).toBeDefined();
      expect(Number(response.headers['x-total-count'])).toBe(2);
    });
  });

  describe('GET /api/v1/admin/products/:id', () => {
    it('returns a product by id', async () => {
      const product = await prisma.product.create({
        data: { name: 'Specific', price: 25, stock: 10, categoryId },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/products/${product.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as { id: string; name: string };
      expect(body.id).toBe(product.id);
      expect(body.name).toBe('Specific');
      expect(response.body).toHaveProperty('category');
    });

    it('returns 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/products/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 404 });
        });
    });
  });

  describe('PATCH /api/v1/admin/products/:id', () => {
    it('updates a product successfully', async () => {
      const product = await prisma.product.create({
        data: { name: 'Old Product', price: 100, stock: 5, categoryId },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/products/${product.id}`)
        .set(adminAuthHeader)
        .send({ price: 199.99 })
        .expect(200);

      const body = response.body as { price: number };
      expect(Number(body.price)).toBe(199.99);
    });
  });

  describe('DELETE /api/v1/admin/products/:id', () => {
    it('soft-deletes a product (204) and marks as inactive', async () => {
      const product = await prisma.product.create({
        data: { name: 'To Delete', price: 50, stock: 1, categoryId },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/products/${product.id}`)
        .set(adminAuthHeader)
        .expect(204);

      const saved = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(saved?.active).toBe(false);
    });

    it('returns 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/products/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404);
    });
  });
});
