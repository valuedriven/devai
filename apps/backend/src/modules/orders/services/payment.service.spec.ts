import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentService, PaymentStatus } from './payment.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../database/__mocks__/prisma-service.mock';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: MockPrismaService;
  let eventEmitter: EventEmitter2;
  let emitMock: jest.Mock;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    prisma.$transaction.mockImplementation(async (cb) => cb(prisma));
    emitMock = jest.fn();
    eventEmitter = { emit: emitMock } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
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

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return payments filtered by orderId and status', async () => {
      const payments = [{ id: 'payment-1' }];
      prisma.payment.findMany.mockResolvedValueOnce(payments);

      const result = await service.findAll({
        orderId: 'order-1',
        status: 'Confirmed',
      });

      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1', status: 'Confirmed' },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(payments);
    });

    it('should return all payments when no filters provided', async () => {
      const payments = [{ id: 'payment-1' }];
      prisma.payment.findMany.mockResolvedValueOnce(payments);

      const result = await service.findAll({});

      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: {},
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(payments);
    });
  });

  describe('register', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.register({
          orderId: 'order-1',
          value: 100,
          method: 'Pix',
          date: new Date().toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create payment and not transition status when status is not confirmed', async () => {
      prisma.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Novo',
      });
      prisma.payment.create.mockResolvedValueOnce({ id: 'payment-1' });

      const result = await service.register({
        orderId: 'order-1',
        value: 100,
        method: 'Pix',
        date: new Date().toISOString(),
        status: PaymentStatus.PENDING,
      });

      expect(prisma.payment.create).toHaveBeenCalled();
      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'payment-1' });
    });

    it('should create payment and transition order status when confirmed', async () => {
      prisma.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Novo',
      });
      prisma.payment.create.mockResolvedValueOnce({ id: 'payment-1' });
      prisma.order.update.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Pago',
      });

      const result = await service.register({
        orderId: 'order-1',
        value: 100,
        method: 'Pix',
        date: new Date().toISOString(),
        status: PaymentStatus.CONFIRMED,
      });

      expect(prisma.payment.create).toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'Pago' },
      });
      expect(result).toEqual({ id: 'payment-1' });
      expect(emitMock).toHaveBeenCalled();
    });

    it('should default status to CONFIRMED when not provided', async () => {
      prisma.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Novo',
      });
      prisma.payment.create.mockResolvedValueOnce({ id: 'payment-1' });
      prisma.order.update.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Pago',
      });

      await service.register({
        orderId: 'order-1',
        value: 100,
        method: 'Pix',
        date: new Date().toISOString(),
      });

      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PaymentStatus.CONFIRMED }),
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if payment does not exist', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateStatus('payment-1', PaymentStatus.CONFIRMED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update payment status and transition order when confirmed', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'payment-1',
        orderId: 'order-1',
        status: PaymentStatus.PENDING,
        order: { id: 'order-1', status: 'Novo' },
      });
      prisma.payment.update.mockResolvedValueOnce({
        id: 'payment-1',
        status: PaymentStatus.CONFIRMED,
      });
      prisma.order.update.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Pago',
      });

      const result = await service.updateStatus(
        'payment-1',
        PaymentStatus.CONFIRMED,
      );

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: PaymentStatus.CONFIRMED },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'Pago' },
      });
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
    });

    it('should update payment status without transitioning order when already paid', async () => {
      prisma.payment.findUnique.mockResolvedValueOnce({
        id: 'payment-1',
        orderId: 'order-1',
        status: PaymentStatus.PENDING,
        order: { id: 'order-1', status: 'Pago' },
      });
      prisma.payment.update.mockResolvedValueOnce({
        id: 'payment-1',
        status: PaymentStatus.CONFIRMED,
      });

      const result = await service.updateStatus(
        'payment-1',
        PaymentStatus.CONFIRMED,
      );

      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
    });
  });
});
