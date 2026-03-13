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
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.clerkService.verifyToken(token);
      
      // Attach user info to request
      request.user = decodedToken;
      
      // Sync user with local database (Requirement: RFN-05 / Sync without webhooks)
      // Note: In a production app with high traffic, this should be optimized
      // to avoid calling sync on EVERY request. For now, it meets the "pós-auth" requirement.
      const userId = decodedToken.sub;
      const tenantId = request.tenantId || '00000000-0000-0000-0000-000000000000';
      
      // We can do this asynchronously to not block the request
      // but the requirement says "garantir a sincronização".
      await this.clerkService.syncUser(userId, tenantId);

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
