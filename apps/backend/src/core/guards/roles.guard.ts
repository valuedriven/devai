import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

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

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Normalizing roles from publicMetadata
    let userRoles: string[] = [];
    const metadata = user.publicMetadata || {};

    if (Array.isArray(metadata.roles)) {
      userRoles = metadata.roles;
    } else if (typeof metadata.roles === 'string') {
      userRoles = [metadata.roles];
    } else if (Array.isArray(metadata.role)) {
      userRoles = metadata.role;
    } else if (typeof metadata.role === 'string') {
      userRoles = [metadata.role];
    }

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('User does not have the required roles');
    }

    return true;
  }
}
