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

describe('Admin Categories (integration)', () => {
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

  describe('POST /api/v1/admin/categories', () => {
    it('creates a category successfully (admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set(adminAuthHeader)
        .send({ name: 'Electronics' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const body = response.body as {
        name: string;
        slug: string;
        active: boolean;
      };
      expect(body.name).toBe('Electronics');
      expect(body.slug).toBe('electronics');
      expect(body.active).toBe(true);
    });

    it('returns 400 when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set(adminAuthHeader)
        .send({ name: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toMatchObject({
            type: expect.any(String) as unknown,
            status: 400,
          });
        });
    });

    it('returns 409 for duplicate name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set(adminAuthHeader)
        .send({ name: 'Electronics' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set(adminAuthHeader)
        .send({ name: 'Electronics' })
        .expect(409)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 409 });
        });
    });

    it('returns 401 without auth header', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .send({ name: 'Unauth' })
        .expect(401);
    });

    it('returns 403 for customer role', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set(customerAuthHeader())
        .send({ name: 'Forbidden' })
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/categories', () => {
    it('lists categories with X-Total-Count header (admin)', async () => {
      await prisma.category.create({
        data: { name: 'Cat A', nameNormalized: 'cat a', slug: 'cat-a' },
      });
      await prisma.category.create({
        data: { name: 'Cat B', nameNormalized: 'cat b', slug: 'cat-b' },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/categories')
        .set(adminAuthHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const body = response.body as Array<{ name: string }>;
      expect(body.length).toBe(2);
      expect(response.headers['x-total-count']).toBeDefined();
      expect(Number(response.headers['x-total-count'])).toBe(2);
    });

    it('includes inactive categories when includeInactive=true', async () => {
      await prisma.category.create({
        data: {
          name: 'Active Cat',
          nameNormalized: 'active cat',
          slug: 'active-cat',
          active: true,
        },
      });
      await prisma.category.create({
        data: {
          name: 'Inactive Cat',
          nameNormalized: 'inactive cat',
          slug: 'inactive-cat',
          active: false,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/categories?includeInactive=true')
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as Array<{ name: string }>;
      expect(body.length).toBe(2);
    });

    it('filters by search term', async () => {
      await prisma.category.create({
        data: {
          name: 'Electronics',
          nameNormalized: 'electronics',
          slug: 'electronics',
        },
      });
      await prisma.category.create({
        data: { name: 'Books', nameNormalized: 'books', slug: 'books' },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/categories?search=Electro')
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as Array<{ name: string }>;
      expect(body.length).toBe(1);
      expect(body[0].name).toBe('Electronics');
    });
  });

  describe('GET /api/v1/admin/categories/:id', () => {
    it('returns a category by id', async () => {
      const cat = await prisma.category.create({
        data: {
          name: 'Unique Cat',
          nameNormalized: 'unique cat',
          slug: 'unique-cat',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/categories/${cat.id}`)
        .set(adminAuthHeader)
        .expect(200);

      const body = response.body as { id: string; name: string };
      expect(body.id).toBe(cat.id);
      expect(body.name).toBe('Unique Cat');
    });

    it('returns 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/categories/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({ status: 404 });
        });
    });
  });

  describe('PATCH /api/v1/admin/categories/:id', () => {
    it('updates a category successfully', async () => {
      const cat = await prisma.category.create({
        data: {
          name: 'Old Name',
          nameNormalized: 'old name',
          slug: 'old-name',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/categories/${cat.id}`)
        .set(adminAuthHeader)
        .send({ name: 'New Name' })
        .expect(200);

      const body = response.body as { name: string; slug: string };
      expect(body.name).toBe('New Name');
      expect(body.slug).toBe('new-name');
    });

    it('returns 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/categories/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .send({ name: 'Nope' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/admin/categories/:id', () => {
    it('soft-deletes a category (204)', async () => {
      const cat = await prisma.category.create({
        data: {
          name: 'To Delete',
          nameNormalized: 'to delete',
          slug: 'to-delete',
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${cat.id}`)
        .set(adminAuthHeader)
        .expect(204);

      const saved = await prisma.category.findUnique({
        where: { id: cat.id },
      });
      expect(saved?.active).toBe(false);
    });

    it('returns 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/categories/00000000-0000-0000-0000-000000000000')
        .set(adminAuthHeader)
        .expect(404);
    });
  });

  describe('Soft-delete verification', () => {
    it('excludes soft-deleted category from public GET /api/v1/categories', async () => {
      const cat = await prisma.category.create({
        data: { name: 'Gone', nameNormalized: 'gone', slug: 'gone' },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${cat.id}`)
        .set(adminAuthHeader)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      const body = response.body as Array<{ name: string }>;
      const names = body.map((c) => c.name);
      expect(names).not.toContain('Gone');
    });
  });
});
