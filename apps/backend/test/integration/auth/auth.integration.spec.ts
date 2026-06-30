import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../helpers/app';
import { createMockClerkService, adminAuthHeader } from '../helpers/auth';
import { ClerkService } from '../../../src/core/auth/clerk.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { truncateAll } from '../helpers/database';

describe('Auth (integration)', () => {
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

  describe('GET /api/v1/health', () => {
    it('returns 200 with status ok', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as {
            status: string;
            timestamp: string;
            uptime: number;
          };
          expect(body.status).toBe('ok');
          expect(body.timestamp).toBeDefined();
          expect(body.uptime).toBeDefined();
        });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 200 with authenticated user profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set(adminAuthHeader)
        .expect(200)
        .expect((res) => {
          const body = res.body as {
            id: string;
            email: string;
            roles: string[];
            firstName: string;
          };
          expect(body.id).toBe('admin-id');
          expect(body.email).toBe('admin@test.com');
          expect(body.roles).toEqual(['admin']);
          expect(body.firstName).toBe('Admin');
        });
    });

    it('returns 401 without auth header', () => {
      return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  describe('POST /api/v1/auth/login validation', () => {
    it('returns 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'test123' })
        .expect(400);
    });

    it('returns 400 when password is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com' })
        .expect(400);
    });

    it('returns RFC 9457 problem details on validation error', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400)
        .expect((res) => {
          const body = res.body as {
            type: string;
            title: string;
            status: number;
            detail: string;
          };
          expect(body).toMatchObject({
            type: expect.any(String) as string,
            title: 'Bad Request',
            status: 400,
            detail: expect.any(String) as string,
          });
        });
    });
  });

  describe('POST /api/v1/auth/register validation', () => {
    it('returns 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ password: 'test123456', firstName: 'Test' })
        .expect(400);
    });

    it('returns 400 when password is too short (less than 8 chars)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: '123' })
        .expect(400);
    });

    it('returns RFC 9457 problem details on validation error', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
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
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 204 for logout request', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set(adminAuthHeader)
        .expect(204);
    });
  });

  describe('Role enforcement', () => {
    it('returns 403 when customer role accesses admin endpoint', () => {
      return request(app.getHttpServer())
        .post('/api/v1/admin/products')
        .set('Authorization', 'Bearer customer-token')
        .send({ name: 'Test', price: 10, stock: 1 })
        .expect(403)
        .expect((res) => {
          const body = res.body as {
            type: string;
            title: string;
            status: number;
          };
          expect(body).toMatchObject({
            type: expect.any(String) as string,
            title: 'Forbidden',
            status: 403,
          });
        });
    });
  });
});
