import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ClerkService } from '../auth/clerk.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<
        Request & { user?: { publicMetadata?: Record<string, unknown> } }
      >();

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userRoles = ClerkService.extractRoles(user.publicMetadata);

    const normalizedRequired = requiredRoles.map((r) => r.toLowerCase());
    const normalizedUser = userRoles.map((r) => r.toLowerCase());
    const hasRole = normalizedRequired.some((role) =>
      normalizedUser.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('User does not have the required roles');
    }

    return true;
  }
}
