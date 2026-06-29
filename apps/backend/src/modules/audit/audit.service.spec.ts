import { Test, TestingModule } from '@nestjs/testing';
import { AuditService, AuditEvent } from './audit.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../database/__mocks__/prisma-service.mock';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleAuditLogEvent', () => {
    it('should successfully create an audit log entry', async () => {
      const event: AuditEvent = {
        entityType: 'Order',
        entityId: 'order-123',
        action: 'STATUS_CHANGE',
        userId: 'user-456',
        payload: { from: 'Novo', to: 'Pago' },
      };

      prisma.auditLog.create.mockResolvedValueOnce({
        id: 'log-1',
        ...event,
        createdAt: new Date(),
      });

      await service.handleAuditLogEvent(event);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          entityType: event.entityType,
          entityId: event.entityId,
          action: event.action,
          payload: event.payload,
          userId: event.userId,
        },
      });
    });

    it('should handle errors gracefully during creation', async () => {
      const event: AuditEvent = {
        entityType: 'Order',
        entityId: 'order-123',
        action: 'STATUS_CHANGE',
      };

      const error = new Error('Database connection failed');
      prisma.auditLog.create.mockRejectedValueOnce(error);

      // Should not throw, should log the error instead
      await expect(service.handleAuditLogEvent(event)).resolves.not.toThrow();
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
