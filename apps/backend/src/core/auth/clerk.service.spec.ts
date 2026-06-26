import { Test, TestingModule } from '@nestjs/testing';
import { ClerkService } from './clerk.service';
import { CustomersService } from '../../modules/customers/services/customers.service';

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
    it('should sign a token with the given payload', async () => {
      const payload = { sub: 'user_123', email: 'test@test.com' };
      const token = await service.signInternalToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = { sub: 'user_123', email: 'test@test.com' };
      const token = await service.signInternalToken(payload);
      const decoded = await service.verifyToken(token);
      expect(decoded.sub).toBe('user_123');
      expect(decoded.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const { UnauthorizedException } = jest.requireActual('@nestjs/common');
      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUser', () => {
    it('should return user data for a valid userId', async () => {
      const mockUser = { id: 'user_123', firstName: 'Test' };
      (service as any).clerkClient = {
        users: {
          getUser: jest.fn().mockResolvedValue(mockUser),
        },
      };
      const user = await service.getUser('user_123');
      expect(user.id).toBe('user_123');
    });
  });
});
