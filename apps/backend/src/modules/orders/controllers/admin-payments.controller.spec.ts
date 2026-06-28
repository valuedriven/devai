import { Test, TestingModule } from '@nestjs/testing';
import { AdminPaymentsController } from './admin-payments.controller';
import { PaymentService } from '../services/payment.service';

describe('AdminPaymentsController', () => {
  let controller: AdminPaymentsController;
  let findAllMock: jest.Mock;

  beforeEach(async () => {
    findAllMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPaymentsController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            findAll: findAllMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AdminPaymentsController>(AdminPaymentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return payments filtered by orderId and status', async () => {
      const payments = [
        { id: 'payment-1', orderId: 'order-1', status: 'Confirmed' },
      ];
      findAllMock.mockResolvedValue(payments);

      const result = await controller.findAll('order-1', 'Confirmed');

      expect(result).toEqual(payments);
      expect(findAllMock).toHaveBeenCalledWith({
        orderId: 'order-1',
        status: 'Confirmed',
      });
    });

    it('should return all payments when no filters provided', async () => {
      const payments = [{ id: 'payment-1' }];
      findAllMock.mockResolvedValue(payments);

      const result = await controller.findAll();

      expect(result).toEqual(payments);
      expect(findAllMock).toHaveBeenCalledWith({});
    });
  });
});
