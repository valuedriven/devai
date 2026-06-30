import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface AuditEvent {
  entityType: string;
  entityId: string;
  action: string;
  payload?: Record<string, unknown>;
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
          payload: event.payload as Prisma.InputJsonValue,
          userId: event.userId,
        },
      });
      this.logger.debug(
        `Audit log created: ${event.action} for ${event.entityType}:${event.entityId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create audit log: ${message}`, stack);
    }
  }
}
