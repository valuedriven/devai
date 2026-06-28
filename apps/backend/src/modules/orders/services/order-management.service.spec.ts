import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OrderManagementService,
  OrderStatus,
} from './order-management.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../database/__mocks__/prisma-service.mock';

describe('OrderManagementService', () => {
  let service: OrderManagementService;
  let prisma: MockPrismaService;
  let eventEmitter: EventEmitter2;
  let emitMock: jest.Mock;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    emitMock = jest.fn();
    eventEmitter = {
      emit: emitMock,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderManagementService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<OrderManagementService>(OrderManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transitionStatus', () => {
    it('should transition from New to Paid', async () => {
      const order = { id: 'order-1', status: OrderStatus.NEW };
      prisma.order.findUnique.mockResolvedValueOnce(order);
      prisma.order.update.mockResolvedValueOnce({
        ...order,
        status: OrderStatus.PAID,
      });

      const result = await service.transitionStatus(
        'order-1',
        OrderStatus.PAID,
        'user-1',
      );

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.PAID },
      });
      expect(emitMock).toHaveBeenCalledWith(
        'audit.log',
        expect.objectContaining({
          entityId: 'order-1',
          action: 'STATUS_CHANGE',
          payload: {
            from: OrderStatus.NEW,
            to: OrderStatus.PAID,
            notes: undefined,
          },
        }),
      );
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('should transition from any (except Delivered) to Cancelled', async () => {
      const order = { id: 'order-1', status: OrderStatus.SHIPPED };
      prisma.order.findUnique.mockResolvedValueOnce(order);
      prisma.order.update.mockResolvedValueOnce({
        ...order,
        status: OrderStatus.CANCELLED,
      });

      const result = await service.transitionStatus(
        'order-1',
        OrderStatus.CANCELLED,
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw UnprocessableEntityException for invalid transitions', async () => {
      const order = { id: 'order-1', status: OrderStatus.NEW };
      prisma.order.findUnique.mockResolvedValueOnce(order);

      await expect(
        service.transitionStatus('order-1', OrderStatus.SHIPPED),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException when transitioning from Delivered', async () => {
      const order = { id: 'order-1', status: OrderStatus.DELIVERED };
      prisma.order.findUnique.mockResolvedValueOnce(order);

      await expect(
        service.transitionStatus('order-1', OrderStatus.CANCELLED),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.transitionStatus('non-existent', OrderStatus.PAID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow transitioning to the same status', async () => {
      const order = { id: 'order-1', status: OrderStatus.NEW };
      prisma.order.findUnique.mockResolvedValueOnce(order);
      prisma.order.update.mockResolvedValueOnce(order);

      const result = await service.transitionStatus('order-1', OrderStatus.NEW);
      expect(result.status).toBe(OrderStatus.NEW);
    });
  });

  describe('findAll', () => {
    it('should apply filters correctly', async () => {
      prisma.order.findMany.mockResolvedValueOnce([]);

      const filters = {
        status: OrderStatus.NEW,
        customerId: 'cust-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      await service.findAll(filters);

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: OrderStatus.NEW,
          customerId: 'cust-1',
          createdAt: {
            gte: new Date('2026-01-01'),
            lte: new Date('2026-01-31'),
          },
        },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return orders without filters', async () => {
      prisma.order.findMany.mockResolvedValueOnce([]);

      await service.findAll({});

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return order with audit logs', async () => {
      const order = {
        id: 'order-1',
        status: OrderStatus.NEW,
        customer: { id: 'cust-1' },
        orderItems: [],
        payments: [],
      };
      const auditLogs = [{ id: 'log-1', action: 'STATUS_CHANGE' }];

      prisma.order.findUnique.mockResolvedValueOnce(order);
      prisma.auditLog.findMany.mockResolvedValueOnce(auditLogs);

      const result = await service.findOne('order-1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          customer: true,
          orderItems: { include: { product: true } },
          payments: true,
        },
      });
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { entityId: 'order-1', entityType: 'Order' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ ...order, auditLogs });
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
