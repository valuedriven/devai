import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.headers['x-tenant-id'];
        const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!tenantId || !uuidRegex.test(tenantId)) {
            request['tenantId'] = DEFAULT_TENANT_ID;
        } else {
            request['tenantId'] = tenantId;
        }

        return next.handle();
    }
}
