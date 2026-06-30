import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkService } from '../../core/auth/clerk.service';
import { createMockClerkService } from '../../core/auth/__mocks__/clerk-service.mock';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import type { App } from 'supertest/types';

const mockUser = {
  id: 'user_123',
  emailAddresses: [{ emailAddress: 'john@example.com' }],
  firstName: 'John',
  lastName: 'Doe',
  imageUrl: 'https://example.com/avatar.png',
  publicMetadata: { roles: ['admin'] },
};

describe('AuthController (Integration)', () => {
  let app: INestApplication<App>;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockClerkService = createMockClerkService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ClerkService,
          useValue: mockClerkService,
        },
      ],
    }).compile();

    app = module.createNestApplication<INestApplication<App>>();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: typeof mockUser }).user = mockUser;
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login and set auth cookie', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue({
        token: 'jwt-token',
        user: {
          id: 'user_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'password123' })
        .expect(201);

      // Assert
      const body = response.body as { token: string };
      expect(body.token).toBe('jwt-token');
    });

    it('should reject login with invalid email', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('should reject login with missing password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'john@example.com' })
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should register and set auth cookie', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue({
        token: 'jwt-token',
        user: {
          id: 'user_456',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'jane@example.com',
          password: 'secure123',
          firstName: 'Jane',
          lastName: 'Smith',
        })
        .expect(201);

      // Assert
      const body = response.body as { token: string };
      expect(body.token).toBe('jwt-token');
    });

    it('should reject registration with short password', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'jane@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should reject registration with invalid email', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid',
          password: 'secure123',
        })
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user info', async () => {
      // Arrange
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        id: 'user_123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['admin'],
        imageUrl: 'https://example.com/avatar.png',
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout and clear cookie', async () => {
      // Arrange
      mockClerkService.verifyToken.mockReturnValue({ sub: 'user_123' });
      mockClerkService.revokeSession.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(204);

      // Assert
      expect(mockClerkService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockClerkService.revokeSession).toHaveBeenCalledWith('user_123');
    });

    it('should logout even without auth header', async () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(204);
    });
  });
});
