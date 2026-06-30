import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../helpers/app';
import { PrismaService } from '../../../src/database/prisma.service';
import { truncateAll } from '../helpers/database';

describe('Public Catalog (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  async function seedData() {
    const cat = await prisma.category.create({
      data: {
        name: 'Public Category',
        nameNormalized: 'public category',
        slug: `public-cat-${Date.now()}`,
        active: true,
      },
    });

    await prisma.category.create({
      data: {
        name: 'Inactive Category',
        nameNormalized: 'inactive category',
        slug: `inactive-cat-${Date.now()}`,
        active: false,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Public Product',
        description: 'A great product',
        price: 99.99,
        stock: 10,
        active: true,
        categoryId: cat.id,
      },
    });

    const inactiveProduct = await prisma.product.create({
      data: {
        name: 'Inactive Product',
        description: 'Inactive',
        price: 49.99,
        stock: 0,
        active: false,
        categoryId: cat.id,
      },
    });

    return { cat, product, inactiveProduct };
  }

  describe('GET /api/v1/categories', () => {
    it('returns only active categories to unauthenticated users', async () => {
      await seedData();

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      const body = response.body as Array<{ name: string }>;
      const names = body.map((c) => c.name);
      expect(names).toContain('Public Category');
      expect(names).not.toContain('Inactive Category');
    });

    it('returns X-Total-Count header', async () => {
      await seedData();

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(response.headers['x-total-count']).toBeDefined();
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('returns an active category', async () => {
      const { cat } = await seedData();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${cat.id}`)
        .expect(200);

      const body = response.body as { id: string; name: string };
      expect(body.id).toBe(cat.id);
      expect(body.name).toBe('Public Category');
    });

    it('returns 404 for an inactive category', async () => {
      await seedData();
      const inactiveCat = await prisma.category.create({
        data: {
          name: 'Now Inactive',
          nameNormalized: 'now inactive',
          slug: `now-inactive-${Date.now()}`,
          active: false,
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/categories/${inactiveCat.id}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/products', () => {
    it('returns only active products to unauthenticated users', async () => {
      await seedData();

      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      const body = response.body as Array<{ name: string }>;
      const names = body.map((p) => p.name);
      expect(names).toContain('Public Product');
      expect(names).not.toContain('Inactive Product');
    });

    it('returns X-Total-Count header', async () => {
      await seedData();

      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(response.headers['x-total-count']).toBeDefined();
    });

    it('returns 400 for invalid pagination params', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products?page=-1')
        .expect(400)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 400 });
        });
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('returns an active product', async () => {
      const { product } = await seedData();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      const body = response.body as { id: string; name: string };
      expect(body.id).toBe(product.id);
      expect(body.name).toBe('Public Product');
    });

    it('returns 404 for an inactive product', async () => {
      const { inactiveProduct } = await seedData();

      await request(app.getHttpServer())
        .get(`/api/v1/products/${inactiveProduct.id}`)
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 404 });
        });
    });

    it('returns 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
