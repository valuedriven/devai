import { Test, TestingModule } from '@nestjs/testing';
import type { JwtPayload } from 'jsonwebtoken';
import { ClerkService } from './clerk.service';
import { CustomersService } from '../../modules/customers/services/customers.service';

const mockClerkClient = {
  users: {
    getUser: jest.fn(),
    getUserList: jest.fn(),
    createUser: jest.fn(),
    verifyPassword: jest.fn(),
    getSessions: jest.fn(),
  },
  signInTokens: {
    createSignInToken: jest.fn(),
  },
  sessions: {
    revokeSession: jest.fn(),
  },
};

jest.mock('@clerk/clerk-sdk-node', () => ({
  createClerkClient: jest.fn(() => mockClerkClient),
}));

describe('ClerkService', () => {
  let service: ClerkService;

  const mockCustomersService = {
    findByClerkId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkService,
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    service = module.get<ClerkService>(ClerkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signInternalToken', () => {
    it('should sign a token with the given payload', () => {
      // Arrange
      const payload = { sub: 'user_123', email: 'test@test.com' };
      // Act
      const token = service.signInternalToken(payload);
      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      // Arrange
      const payload = { sub: 'user_123', email: 'test@test.com' };
      // Act
      const token = service.signInternalToken(payload);
      const decoded = service.verifyToken(token) as JwtPayload & {
        email?: string;
      };
      // Assert
      expect(decoded.sub).toBe('user_123');
      expect(decoded.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      // Arrange
      const { UnauthorizedException } =
        jest.requireActual<typeof import('@nestjs/common')>('@nestjs/common');
      // Act & Assert
      expect(() => service.verifyToken('invalid-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUser', () => {
    it('should return user data for a valid userId', async () => {
      // Arrange
      const mockUser = { id: 'user_123', firstName: 'Test' };
      mockClerkClient.users.getUser.mockResolvedValue(mockUser);

      // Act
      const user = await service.getUser('user_123');

      // Assert
      expect(user.id).toBe('user_123');
    });
  });
});
