import { Test, TestingModule } from '@nestjs/testing';
import { AdminOrdersController } from './admin-orders.controller';
import {
  OrderManagementService,
  OrderStatus,
} from '../services/order-management.service';
import { PaymentService } from '../services/payment.service';

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
      const orders = [{ id: 'order-1', status: OrderStatus.NEW }];
      findAllMock.mockResolvedValue(orders);

      const result = await controller.findAll({
        status: OrderStatus.NEW,
        customerId: 'cust-1',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

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
      const order = { id: 'order-1', status: OrderStatus.NEW };
      findOneMock.mockResolvedValue(order);

      const result = await controller.findOne('order-1');

      expect(result).toEqual(order);
      expect(findOneMock).toHaveBeenCalledWith('order-1');
    });
  });

  describe('transitionStatus', () => {
    it('should transition order status', async () => {
      const updatedOrder = { id: 'order-1', status: OrderStatus.PAID };
      transitionStatusMock.mockResolvedValue(updatedOrder);

      const user = { sub: 'user-1' };
      const result = await controller.transitionStatus(
        'order-1',
        { status: OrderStatus.PAID, notes: 'Payment confirmed' },
        user,
      );

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
      const payment = { id: 'payment-1' };
      registerPaymentMock.mockResolvedValue(payment);

      const user = { sub: 'user-1' };
      const result = await controller.registerPayment(
        'order-1',
        {
          value: 100,
          method: 'Pix',
          date: new Date().toISOString(),
          notes: 'Note',
          status: 'Confirmed' as any,
        },
        user,
      );

      expect(result).toEqual(payment);
      expect(registerPaymentMock).toHaveBeenCalledWith(
        {
          orderId: 'order-1',
          value: 100,
          method: 'Pix',
          date: expect.any(String),
          notes: 'Note',
          status: 'Confirmed',
        },
        'user-1',
      );
    });
  });
});
