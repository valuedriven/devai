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

describe('Admin Products (e2e)', () => {
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
          if (id === 'user-id')
            return {
              id,
              publicMetadata: { roles: [] },
              emailAddresses: [{ emailAddress: 'user@e2e.com' }],
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

  afterAll(async () => {
    await cleanDatabase();
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

  describe('/admin/products API', () => {
    let categoryId: string;
    let productId: string;

    beforeAll(async () => {
      try {
        const cat = await prisma.category.create({
          data: {
            name: 'Admin Category',
            nameNormalized: 'admin category',
            slug: `admin-category-${Date.now()}`,
            active: true,
          },
        });
        categoryId = cat.id;
      } catch (err) {
        console.error('Error creating category in beforeAll:', err);
      }
    });

    it('should block non-admin users (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set('Authorization', 'Bearer user-token')
        .send({
          name: 'Block Me',
          price: 10,
          stock: 10,
        })
        .expect(403);
    });

    it('should create a product (admin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Admin Product',
          description: 'Created by admin',
          price: 150.5,
          stock: 20,
          categoryId: categoryId,
        });

      if (response.status !== 201) {
        console.error('Failed to create product:', response.body);
      }

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Admin Product');
      productId = response.body.id;
    });

    it('should fail validation when price is negative', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Bad Price',
          price: -5,
          stock: 10,
        })
        .expect(400);
    });

    it('should list products (admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/products')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(productId);
    });

    it('should upload an image (admin)', async () => {
      // Mocking a file upload
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/products/upload')
        .set('Authorization', 'Bearer admin-token')
        .attach('file', Buffer.from('fake image content'), 'test.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toMatch(/^\/uploads\//);
    });

    it('should update a product (admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/products/${productId}`)
        .set('Authorization', 'Bearer admin-token')
        .send({
          price: 199.99,
        })
        .expect(200);

      expect(parseFloat(response.body.price)).toBe(199.99);
    });

    it('should soft delete a product (admin)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/products/${productId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(204);

      // Verify it is inactive but still retrievable
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/products/${productId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.active).toBe(false);
    });
  });
});
