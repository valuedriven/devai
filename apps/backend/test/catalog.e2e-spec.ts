import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { AuthGuard } from './../src/core/guards/auth.guard';
import { RolesGuard } from './../src/core/guards/roles.guard';

describe('Catalog (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    (BigInt.prototype as any).toJSON = function (this: bigint) {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'e2e-admin-user-id',
            publicMetadata: { roles: ['admin'] },
            emailAddresses: [{ emailAddress: 'admin@e2e-test.com' }],
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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

  describe('Categories API', () => {
    let categoryId: string;

    it('should create a category', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'E2E Electronics',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Electronics');
      categoryId = response.body.id;
    });

    it('should list categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const found = response.body.find((c: any) => c.id === categoryId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Electronics');
    });

    it('should find a category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe('E2E Electronics');
    });

    it('should update a category', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/categories/${categoryId}`)
        .send({
          name: 'E2E Smart Electronics',
        })
        .expect(200);

      expect(response.body.name).toBe('E2E Smart Electronics');
    });

    it('should reject invalid input when creating a category', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: '',
        })
        .expect(400);
    });
  });

  describe('Products API', () => {
    let categoryId: string;
    let productId: string;

    beforeAll(async () => {
      const cat = await prisma.category.create({
        data: {
          name: 'Category For Products',
          nameNormalized: 'category for products',
          slug: 'category-for-products',
          active: true,
        },
      });
      categoryId = cat.id;
    });

    it('should create a product', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'E2E Smartphone',
          description: 'A premium phone',
          price: 999.99,
          stock: 50,
          categoryId: categoryId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Smartphone');
      expect(parseFloat(response.body.price)).toBe(999.99);
      productId = response.body.id;
    });

    it('should list products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const found = response.body.find((p: any) => p.id === productId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Smartphone');
    });

    it('should find a product by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('E2E Smartphone');
    });

    it('should update a product', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}`)
        .send({
          price: 899.99,
          stock: 45,
        })
        .expect(200);

      expect(parseFloat(response.body.price)).toBe(899.99);
      expect(response.body.stock).toBe(45);
    });

    it('should reject invalid price or stock', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Cheap Phone',
          price: -10,
          stock: 10,
          categoryId: categoryId,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Cheap Phone',
          price: 100,
          stock: -5,
          categoryId: categoryId,
        })
        .expect(400);
    });

    it('should delete a product', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/products/${productId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .expect(404);
    });
  });
});
