import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthGuard } from './../src/core/guards/auth.guard';
import { RolesGuard } from './../src/core/guards/roles.guard';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    (BigInt.prototype as any).toJSON = function (this: bigint) {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(require('./../src/core/auth/clerk.service').ClerkService)
      .useValue({
        verifyToken: jest.fn().mockResolvedValue({ sub: 'test-user-id' }),
        getUser: jest.fn().mockResolvedValue({
          id: 'test-user-id',
          publicMetadata: { roles: ['admin'] },
          emailAddresses: [{ emailAddress: 'admin@test.com' }],
          firstName: 'Admin',
          lastName: 'User',
          imageUrl: 'https://example.com/avatar.png',
        }),
        revokeSession: jest.fn().mockResolvedValue(true),
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return authenticated user profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe('test-user-id');
          expect(res.body.email).toBe('admin@test.com');
          expect(res.body.roles).toEqual(['admin']);
          expect(res.body.firstName).toBe('Admin');
        });
    });

    it('should return 401 without auth header', () => {
      return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 204 for logout request', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(204);
    });
  });

  describe('POST /api/v1/auth/login validation', () => {
    it('should return 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'test123' })
        .expect(400);
    });

    it('should return 400 when password is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/register validation', () => {
    it('should return 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ password: 'test123456', firstName: 'Test' })
        .expect(400);
    });

    it('should return 400 when password is too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: '123' })
        .expect(400);
    });
  });

  describe('Role enforcement', () => {
    it('should enforce ADMIN role on admin endpoints', async () => {
      const mockUser = {
        id: 'customer-user-id',
        publicMetadata: { roles: ['customer'] },
        emailAddresses: [{ emailAddress: 'customer@test.com' }],
      };

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(require('./../src/core/auth/clerk.service').ClerkService)
        .useValue({
          verifyToken: jest.fn().mockResolvedValue({ sub: 'customer-user-id' }),
          getUser: jest.fn().mockResolvedValue({
            id: 'customer-user-id',
            publicMetadata: { roles: ['customer'] },
            emailAddresses: [{ emailAddress: 'customer@test.com' }],
          }),
        })
        .compile();

      const customerApp = moduleFixture.createNestApplication();
      customerApp.setGlobalPrefix('api/v1');
      await customerApp.init();

      return request(customerApp.getHttpServer())
        .post('/api/v1/products')
        .send({ name: 'Test', price: 10, stock: 1, categoryId: 1 })
        .set('Authorization', 'Bearer customer-token')
        .expect(403);
    });
  });
});
