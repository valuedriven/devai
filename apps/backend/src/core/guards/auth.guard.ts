import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    let decodedToken;
    try {
      decodedToken = await this.clerkService.verifyToken(token);
    } catch (error) {
      this.loggingVerificationError(token, error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(
        `Invalid token. ${detail.includes('JWK') ? 'Failed to resolve verification keys. Check CLERK_SECRET_KEY/CLERK_JWT_KEY.' : 'Details: ' + detail}`,
      );
    }

    const userId = decodedToken.sub;
    const clerkUser = await this.clerkService.getUser(userId);
    request.user = clerkUser;

    return true;
  }

  private loggingVerificationError(token: string, error: any) {
    this.logger.error('AuthGuard verification error:', error);
  }
}
