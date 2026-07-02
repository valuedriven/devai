/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkService } from '../../core/auth/clerk.service';
import { createMockClerkService } from '../../core/auth/__mocks__/clerk-service.mock';
import { ValidationPipe } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';

const mockUser = {
  id: 'user_123',
  emailAddresses: [{ emailAddress: 'john@example.com' }],
  firstName: 'John',
  lastName: 'Doe',
  imageUrl: 'https://example.com/avatar.png',
  publicMetadata: { roles: ['admin'] },
};

describe('AuthController', () => {
  let controller: AuthController;

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

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login and set auth cookie', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };
      const loginResult = {
        token: 'jwt-token',
        user: {
          id: 'user_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      mockAuthService.login.mockResolvedValue(loginResult);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      // Act
      const result = await controller.login(dto, mockResponse);

      // Assert
      expect(result).toEqual(loginResult);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'devai_auth_token',
        'jwt-token',
        expect.any(Object),
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });

    it('should reject login with invalid email via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = { type: 'body' as const, metatype: LoginDto, data: '' };

      await expect(
        target.transform(
          { email: 'not-an-email', password: 'password123' },
          metadata,
        ),
      ).rejects.toThrow();
    });

    it('should reject login with missing password via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = { type: 'body' as const, metatype: LoginDto, data: '' };

      await expect(
        target.transform({ email: 'john@example.com' }, metadata),
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register and set auth cookie', async () => {
      // Arrange
      const dto: RegisterDto = {
        email: 'jane@example.com',
        password: 'secure123',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const registerResult = {
        token: 'jwt-token',
        user: {
          id: 'user_456',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };
      mockAuthService.register.mockResolvedValue(registerResult);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      // Act
      const result = await controller.register(dto, mockResponse);

      // Assert
      expect(result).toEqual(registerResult);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'devai_auth_token',
        'jwt-token',
        expect.any(Object),
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('should reject registration with short password via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: RegisterDto,
        data: '',
      };

      await expect(
        target.transform(
          {
            email: 'jane@example.com',
            password: '123',
          },
          metadata,
        ),
      ).rejects.toThrow();
    });

    it('should reject registration with invalid email via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: RegisterDto,
        data: '',
      };

      await expect(
        target.transform(
          {
            email: 'invalid',
            password: 'secure123',
          },
          metadata,
        ),
      ).rejects.toThrow();
    });
  });

  describe('getMe', () => {
    it('should return current user info', () => {
      // Arrange
      const mockReq = {
        user: mockUser,
      } as unknown as Request;

      // Act
      const result = controller.getMe(mockReq);

      // Assert
      expect(result).toEqual({
        id: 'user_123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['admin'],
        imageUrl: 'https://example.com/avatar.png',
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear cookie', async () => {
      // Arrange
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      } as unknown as Request;
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      mockClerkService.verifyToken.mockReturnValue({ sub: 'user_123' });
      mockClerkService.revokeSession.mockResolvedValue(undefined);

      // Act
      await controller.logout(mockReq, mockRes);

      // Assert
      expect(mockRes.clearCookie).toHaveBeenCalledWith('devai_auth_token', {
        path: '/',
      });
      expect(mockClerkService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockClerkService.revokeSession).toHaveBeenCalledWith('user_123');
    });

    it('should logout even without auth header', async () => {
      // Arrange
      const mockReq = {
        headers: {},
      } as unknown as Request;
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      // Act
      await controller.logout(mockReq, mockRes);

      // Assert
      expect(mockRes.clearCookie).toHaveBeenCalledWith('devai_auth_token', {
        path: '/',
      });
      expect(mockClerkService.verifyToken).not.toHaveBeenCalled();
      expect(mockClerkService.revokeSession).not.toHaveBeenCalled();
    });
  });
});
