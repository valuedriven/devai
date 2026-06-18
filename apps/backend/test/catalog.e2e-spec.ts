import * as dotenv from 'dotenv';
import { resolve } from 'path';
// Load environment variables from root .env file before anything else
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
  const testTenantId = 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2';

  beforeAll(async () => {
    // Ensure BigInt serialization matches main.ts setup
    (BigInt.prototype as any).toJSON = function (this: bigint) {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override auth guard to simulate an authenticated admin user
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

    // Clean up any existing E2E test data for this tenant
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  async function cleanDatabase() {
    // Clean products first because of foreign keys
    await prisma.product.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.category.deleteMany({
      where: { tenantId: testTenantId },
    });
  }

  describe('Categories API', () => {
    let categoryId: string;

    it('should create a category', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('x-tenant-id', testTenantId)
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
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const found = response.body.find((c: any) => c.id === categoryId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Electronics');
    });

    it('should find a category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe('E2E Electronics');
    });

    it('should update a category', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/categories/${categoryId}`)
        .set('x-tenant-id', testTenantId)
        .send({
          name: 'E2E Smart Electronics',
        })
        .expect(200);

      expect(response.body.name).toBe('E2E Smart Electronics');
    });

    it('should reject invalid input when creating a category', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('x-tenant-id', testTenantId)
        .send({
          name: '', // Empty name should fail validation
        })
        .expect(400);
    });
  });

  describe('Products API', () => {
    let categoryId: string;
    let productId: string;

    beforeAll(async () => {
      // Create a category for products testing
      const cat = await prisma.category.create({
        data: {
          name: 'Category For Products',
          tenantId: testTenantId,
        },
      });
      categoryId = cat.id.toString();
    });

    it('should create a product', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('x-tenant-id', testTenantId)
        .send({
          name: 'E2E Smartphone',
          description: 'A premium phone',
          price: 999.99,
          stock: 50,
          categoryId: parseInt(categoryId),
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
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const found = response.body.find((p: any) => p.id === productId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Smartphone');
    });

    it('should find a product by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('E2E Smartphone');
    });

    it('should update a product', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}`)
        .set('x-tenant-id', testTenantId)
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
        .set('x-tenant-id', testTenantId)
        .send({
          name: 'Cheap Phone',
          price: -10, // Invalid negative price
          stock: 10,
          categoryId: parseInt(categoryId),
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('x-tenant-id', testTenantId)
        .send({
          name: 'Cheap Phone',
          price: 100,
          stock: -5, // Invalid negative stock
          categoryId: parseInt(categoryId),
        })
        .expect(400);
    });

    it('should delete a product', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/products/${productId}`)
        .set('x-tenant-id', testTenantId)
        .expect(200);

      // Verify it is no longer retrievable
      await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set('x-tenant-id', testTenantId)
        .expect(404);
    });
  });
});
