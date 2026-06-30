import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = (userRoles?: string[]) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: userRoles
          ? {
              publicMetadata: { roles: userRoles },
            }
          : undefined,
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when no roles are required', () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const result = guard.canActivate(
      mockExecutionContext() as unknown as ExecutionContext,
    );
    // Assert
    expect(result).toBe(true);
  });

  it('should allow ADMIN user to access admin endpoints', () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    const result = guard.canActivate(
      mockExecutionContext(['admin']) as unknown as ExecutionContext,
    );
    // Assert
    expect(result).toBe(true);
  });

  it('should deny CUSTOMER user access to admin endpoints', () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    // Assert
    expect(() =>
      guard.canActivate(
        mockExecutionContext(['customer']) as unknown as ExecutionContext,
      ),
    ).toThrow(ForbiddenException);
  });

  it('should deny unauthenticated user access', () => {
    // Arrange
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    // Assert
    expect(() =>
      guard.canActivate(mockExecutionContext() as unknown as ExecutionContext),
    ).toThrow(UnauthorizedException);
  });
});
