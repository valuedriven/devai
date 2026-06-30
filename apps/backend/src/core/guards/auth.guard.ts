import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ClerkService } from '../auth/clerk.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly clerkService: ClerkService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: Record<string, unknown> }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    let decodedToken: jwt.JwtPayload;
    try {
      const verified = this.clerkService.verifyToken(token);
      if (typeof verified === 'string' || !verified.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }
      decodedToken = verified;
    } catch (error) {
      this.loggingVerificationError(token, error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(
        `Invalid token. ${detail.includes('JWK') ? 'Failed to resolve verification keys. Check CLERK_SECRET_KEY/CLERK_JWT_KEY.' : 'Details: ' + detail}`,
      );
    }

    const userId = decodedToken.sub!;
    const clerkUser = await this.clerkService.getUser(userId);

    const roles = ClerkService.extractRoles(
      clerkUser.publicMetadata as Record<string, unknown> | undefined,
    );
    const role = roles.map((r) => r.toUpperCase()).includes('ADMIN')
      ? 'ADMIN'
      : 'CUSTOMER';

    request.user = {
      ...clerkUser,
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      name:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        undefined,
      role,
    };

    return true;
  }

  private loggingVerificationError(token: string, error: unknown) {
    this.logger.error('AuthGuard verification error:', error);
  }
}
