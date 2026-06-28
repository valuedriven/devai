import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';

export interface AuditEvent {
  entityType: string;
  entityId: string;
  action: string;
  payload?: any;
  userId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('audit.log')
  async handleAuditLogEvent(event: AuditEvent) {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: event.entityType,
          entityId: event.entityId,
          action: event.action,
          payload: event.payload,
          userId: event.userId,
        },
      });
      this.logger.debug(
        `Audit log created: ${event.action} for ${event.entityType}:${event.entityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
    }
  }
}
