import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClerkService } from '../../core/auth/clerk.service';
import { createMockClerkService } from '../../core/auth/__mocks__/clerk-service.mock';

describe('AuthService', () => {
  let service: AuthService;
  let clerk: ReturnType<typeof createMockClerkService>;

  beforeEach(async () => {
    clerk = createMockClerkService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ClerkService,
          useValue: clerk,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
      };

      clerk.verifyPassword.mockResolvedValue(mockUser);
      clerk.syncUserWithData.mockResolvedValue({ id: 'cust_1' });
      clerk.signInternalToken.mockResolvedValue('signed-jwt-token');

      const result = await service.login('john@example.com', 'password123');

      expect(clerk.verifyPassword).toHaveBeenCalledWith(
        'john@example.com',
        'password123',
      );
      expect(clerk.syncUserWithData).toHaveBeenCalledWith(mockUser);
      expect(clerk.signInternalToken).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.emailAddresses[0].emailAddress,
      });
      expect(result).toEqual({
        token: 'signed-jwt-token',
        user: {
          id: 'user_123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    it('should propagate error when credentials are invalid', async () => {
      const error = new Error('Invalid credentials');
      clerk.verifyPassword.mockRejectedValue(error);

      await expect(service.login('wrong@example.com', 'wrong')).rejects.toThrow(
        error,
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: 'user_456',
        emailAddresses: [{ emailAddress: 'jane@example.com' }],
        firstName: 'Jane',
        lastName: 'Smith',
      };

      clerk.createUser.mockResolvedValue(mockUser);
      clerk.signInternalToken.mockResolvedValue('signed-jwt-token');

      const result = await service.register({
        email: 'jane@example.com',
        password: 'secure123',
        firstName: 'Jane',
        lastName: 'Smith',
      });

      expect(clerk.createUser).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'secure123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'customer',
      });
      expect(clerk.signInternalToken).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.emailAddresses[0].emailAddress,
      });
      expect(result).toEqual({
        token: 'signed-jwt-token',
        user: {
          id: 'user_456',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      });
    });

    it('should propagate error when user creation fails', async () => {
      const error = new Error('Email already exists');
      clerk.createUser.mockRejectedValue(error);

      await expect(
        service.register({ email: 'existing@example.com' }),
      ).rejects.toThrow(error);
    });

    it('should handle missing optional fields', async () => {
      const mockUser = {
        id: 'user_789',
        emailAddresses: [{ emailAddress: 'anon@example.com' }],
        firstName: null,
        lastName: null,
      };

      clerk.createUser.mockResolvedValue(mockUser);
      clerk.signInternalToken.mockResolvedValue('token');

      const result = await service.register({
        email: 'anon@example.com',
      });

      expect(result.user.firstName).toBeNull();
      expect(result.user.lastName).toBeNull();
    });
  });
});
