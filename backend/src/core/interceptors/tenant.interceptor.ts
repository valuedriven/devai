import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      tenantId?: string;
    }>();
    const tenantIdHeader = request.headers['x-tenant-id'];
    const tenantId = Array.isArray(tenantIdHeader)
      ? tenantIdHeader[0]
      : tenantIdHeader;
    const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!tenantId || !uuidRegex.test(tenantId)) {
      request.tenantId = DEFAULT_TENANT_ID;
    } else {
      request.tenantId = tenantId;
    }

    return next.handle() as any;
  }
}
