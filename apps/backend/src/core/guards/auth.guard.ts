import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ClerkService } from '../auth/clerk.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly clerkService: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // After token is verified, any further errors (DB connection, etc) should be 500, not 401.
    const userId = decodedToken.sub;
    const tenantId =
      request.tenantId || '00000000-0000-0000-0000-000000000000';

    // Attach the full user info to request (from Clerk API)
    const clerkUser = await this.clerkService.getUser(userId);
    request.user = clerkUser;

    // Sync user with local database
    await this.clerkService.syncUserWithData(clerkUser, tenantId);

    return true;
  }

  private loggingVerificationError(token: string, error: any) {
    console.error('AuthGuard verification error:', error);
  }
}
