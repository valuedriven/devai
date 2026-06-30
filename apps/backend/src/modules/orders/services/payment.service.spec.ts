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

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    prisma = createMockPrismaService();
    prisma.$transaction.mockImplementation(
      async (cb: (tx: MockPrismaService) => Promise<unknown>) =>
        await cb(prisma),
    );
    emitMock = jest.fn();
    eventEmitter = { emit: emitMock } as unknown as EventEmitter2;

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
      // Arrange
      const payments = [{ id: 'payment-1' }];
      prisma.payment.findMany.mockResolvedValueOnce(payments);

      // Act
      const result = await service.findAll({
        orderId: 'order-1',
        status: 'Confirmed',
      });

      // Assert
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1', status: 'Confirmed' },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(payments);
    });

    it('should return all payments when no filters provided', async () => {
      // Arrange
      const payments = [{ id: 'payment-1' }];
      prisma.payment.findMany.mockResolvedValueOnce(payments);

      // Act
      const result = await service.findAll({});

      // Assert
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
      // Arrange
      prisma.order.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.register({
          orderId: 'order-1',
          value: 100,
          method: 'Pix',
          date: '2024-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create payment and not transition status when status is not confirmed', async () => {
      // Arrange
      prisma.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Novo',
      });
      prisma.payment.create.mockResolvedValueOnce({ id: 'payment-1' });

      // Act
      const result = await service.register({
        orderId: 'order-1',
        value: 100,
        method: 'Pix',
        date: '2024-01-01T00:00:00.000Z',
        status: PaymentStatus.PENDING,
      });

      // Assert
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'payment-1' });
    });

    it('should create payment and transition order status when confirmed', async () => {
      // Arrange
      prisma.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Novo',
      });
      prisma.payment.create.mockResolvedValueOnce({ id: 'payment-1' });
      prisma.order.update.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Pago',
      });

      // Act
      const result = await service.register({
        orderId: 'order-1',
        value: 100,
        method: 'Pix',
        date: '2024-01-01T00:00:00.000Z',
        status: PaymentStatus.CONFIRMED,
      });

      // Assert
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'Pago' },
      });
      expect(result).toEqual({ id: 'payment-1' });
      expect(emitMock).toHaveBeenCalled();
    });

    it('should default status to CONFIRMED when not provided', async () => {
      // Arrange
      prisma.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Novo',
      });
      prisma.payment.create.mockResolvedValueOnce({ id: 'payment-1' });
      prisma.order.update.mockResolvedValueOnce({
        id: 'order-1',
        status: 'Pago',
      });

      // Act
      await service.register({
        orderId: 'order-1',
        value: 100,
        method: 'Pix',
        date: '2024-01-01T00:00:00.000Z',
      });

      // Assert
      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.CONFIRMED,
          }) as unknown,
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if payment does not exist', async () => {
      // Arrange
      prisma.payment.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateStatus('payment-1', PaymentStatus.CONFIRMED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update payment status and transition order when confirmed', async () => {
      // Arrange
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

      // Act
      const result = await service.updateStatus(
        'payment-1',
        PaymentStatus.CONFIRMED,
      );

      // Assert
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
      // Arrange
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

      // Act
      const result = await service.updateStatus(
        'payment-1',
        PaymentStatus.CONFIRMED,
      );

      // Assert
      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
    });
  });
});
