import { Test, TestingModule } from '@nestjs/testing';
import { AdminOrdersController } from './admin-orders.controller';
import {
  OrderManagementService,
  OrderStatus,
} from '../services/order-management.service';
import { PaymentService, PaymentStatus } from '../services/payment.service';

describe('AdminOrdersController', () => {
  let controller: AdminOrdersController;
  let findAllMock: jest.Mock;
  let findOneMock: jest.Mock;
  let transitionStatusMock: jest.Mock;
  let registerPaymentMock: jest.Mock;

  beforeEach(async () => {
    findAllMock = jest.fn();
    findOneMock = jest.fn();
    transitionStatusMock = jest.fn();
    registerPaymentMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [
        {
          provide: OrderManagementService,
          useValue: {
            findAll: findAllMock,
            findOne: findOneMock,
            transitionStatus: transitionStatusMock,
          },
        },
        {
          provide: PaymentService,
          useValue: {
            register: registerPaymentMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AdminOrdersController>(AdminOrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return orders with filters', async () => {
      // Arrange
      const orders = [{ id: 'order-1', status: OrderStatus.NEW }];
      findAllMock.mockResolvedValue(orders);

      // Act
      const result = await controller.findAll({
        status: OrderStatus.NEW,
        customerId: 'cust-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      // Assert
      expect(result).toEqual(orders);
      expect(findAllMock).toHaveBeenCalledWith({
        status: OrderStatus.NEW,
        customerId: 'cust-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });
    });
  });

  describe('findOne', () => {
    it('should return order details', async () => {
      // Arrange
      const order = { id: 'order-1', status: OrderStatus.NEW };
      findOneMock.mockResolvedValue(order);

      // Act
      const result = await controller.findOne('order-1');

      // Assert
      expect(result).toEqual(order);
      expect(findOneMock).toHaveBeenCalledWith('order-1');
    });
  });

  describe('transitionStatus', () => {
    it('should transition order status', async () => {
      // Arrange
      const updatedOrder = { id: 'order-1', status: OrderStatus.PAID };
      transitionStatusMock.mockResolvedValue(updatedOrder);

      const user = {
        id: 'user-1',
        clerkId: 'user-1',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
      };
      // Act
      const result = await controller.transitionStatus(
        'order-1',
        { status: OrderStatus.PAID, notes: 'Payment confirmed' },
        user,
      );

      // Assert
      expect(result).toEqual(updatedOrder);
      expect(transitionStatusMock).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.PAID,
        'user-1',
        'Payment confirmed',
      );
    });
  });

  describe('registerPayment', () => {
    it('should register a payment', async () => {
      // Arrange
      const payment = { id: 'payment-1' };
      registerPaymentMock.mockResolvedValue(payment);

      const user = {
        id: 'user-1',
        clerkId: 'user-1',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
      };
      // Act
      const result = await controller.registerPayment(
        'order-1',
        {
          value: 100,
          method: 'Pix',
          date: new Date().toISOString(),
          notes: 'Note',
          status: PaymentStatus.CONFIRMED,
        },
        user,
      );

      // Assert
      expect(result).toEqual(payment);
      expect(registerPaymentMock).toHaveBeenCalledWith(
        {
          orderId: 'order-1',
          value: 100,
          method: 'Pix',
          date: expect.any(String) as unknown,
          notes: 'Note',
          status: 'Confirmed',
        },
        'user-1',
      );
    });
  });
});
