import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

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
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const result = guard.canActivate(mockExecutionContext() as any);
    expect(result).toBe(true);
  });

  it('should allow ADMIN user to access admin endpoints', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    const result = guard.canActivate(mockExecutionContext(['admin']) as any);
    expect(result).toBe(true);
  });

  it('should deny CUSTOMER user access to admin endpoints', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() =>
      guard.canActivate(mockExecutionContext(['customer']) as any),
    ).toThrow(ForbiddenException);
  });

  it('should deny unauthenticated user access', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockExecutionContext() as any)).toThrow(
      UnauthorizedException,
    );
  });
});
