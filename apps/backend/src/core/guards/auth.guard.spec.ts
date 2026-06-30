import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ClerkService } from '../auth/clerk.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockClerkService: Partial<ClerkService>;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = (
    hasAuthHeader = true,
    token = 'valid-token',
  ) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: hasAuthHeader ? { authorization: `Bearer ${token}` } : {},
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  beforeEach(async () => {
    mockClerkService = {
      verifyToken: jest.fn(),
      getUser: jest.fn(),
      syncUserWithData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: ClerkService, useValue: mockClerkService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should bypass auth for public endpoints', async () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(true);
    // Act
    const result = await guard.canActivate(
      mockExecutionContext() as unknown as ExecutionContext,
    );
    // Assert
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no auth header', async () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(false);
    // Act & Assert
    await expect(
      guard.canActivate(
        mockExecutionContext(false) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (mockClerkService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    // Act & Assert
    await expect(
      guard.canActivate(mockExecutionContext() as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should allow access with valid token', async () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (mockClerkService.verifyToken as jest.Mock).mockReturnValue({
      sub: 'user_123',
    });
    (mockClerkService.getUser as jest.Mock).mockResolvedValue({
      id: 'user_123',
    });
    (mockClerkService.syncUserWithData as jest.Mock).mockResolvedValue(
      undefined,
    );

    // Act
    const result = await guard.canActivate(
      mockExecutionContext() as unknown as ExecutionContext,
    );
    // Assert
    expect(result).toBe(true);
  });
});
