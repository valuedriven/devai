import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('Public Catalog (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let categoryId: string;
  let productId: string;
  let inactiveProductId: string;

  beforeAll(async () => {
    (BigInt.prototype as any).toJSON = function (this: bigint) {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

    // Create test data
    const cat = await prisma.category.create({
      data: {
        name: 'Public Category',
        nameNormalized: 'public category',
        slug: `public-category-${Date.now()}`,
        active: true,
      },
    });
    categoryId = cat.id;

    await prisma.category.create({
      data: {
        name: 'Inactive Category',
        nameNormalized: 'inactive category',
        slug: `inactive-category-${Date.now()}`,
        active: false,
      },
    });

    const prod = await prisma.product.create({
      data: {
        name: 'Public Product',
        description: 'A great product',
        price: 99.99,
        stock: 10,
        active: true,
        categoryId: categoryId,
      },
    });
    productId = prod.id;

    const inactiveProd = await prisma.product.create({
      data: {
        name: 'Inactive Product',
        description: 'An inactive product',
        price: 49.99,
        stock: 0,
        active: false,
        categoryId: categoryId,
      },
    });
    inactiveProductId = inactiveProd.id;
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

  describe('GET /api/v1/categories', () => {
    it('should return only active categories to unauthenticated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((c: any) => c.name === 'Public Category')).toBe(
        true,
      );
      expect(
        response.body.some((c: any) => c.name === 'Inactive Category'),
      ).toBe(false);
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return an active category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe('Public Category');
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return only active products to unauthenticated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: any) => p.name === 'Public Product')).toBe(
        true,
      );
      expect(
        response.body.some((p: any) => p.name === 'Inactive Product'),
      ).toBe(false);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return an active product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('Public Product');
    });

    it('should return 404 for an inactive product', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/products/${inactiveProductId}`)
        .expect(404);
    });
  });
});
