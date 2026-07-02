import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';
import { NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import type { AuthUser } from '../../../core/auth/interfaces/auth-user.interface';

const adminUser: AuthUser = {
  id: 'admin-id',
  clerkId: 'admin-id',
  email: 'admin@example.com',
  role: 'ADMIN',
};

const customerUser: AuthUser = {
  id: 'cust-id',
  clerkId: 'cust-id',
  email: 'john@example.com',
  role: 'CUSTOMER',
};

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('as admin', () => {
    describe('create', () => {
      it('should create an order using customerId from body', async () => {
        // Arrange
        const dto: CreateOrderDto = {
          customerId: 'cust-1',
          totalAmount: 150.0,
          order_items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50.0 }],
        };
        const expectedResult = { id: 'order-1', ...dto };
        mockOrdersService.create.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.create(dto, adminUser);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.create).toHaveBeenCalledWith(dto, undefined);
      });
    });

    describe('findAll', () => {
      it('should return all orders', async () => {
        // Arrange
        const expectedResult = {
          data: [{ id: 'order-1' }],
          total: 1,
        };
        mockOrdersService.findAll.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.findAll(adminUser);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.findAll).toHaveBeenCalledWith(undefined, {
          skip: 0,
          take: 20,
          status: undefined,
        });
      });

      it('should filter orders by status', async () => {
        // Arrange
        const expectedResult = {
          data: [{ id: 'order-1' }],
          total: 1,
        };
        mockOrdersService.findAll.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.findAll(adminUser, undefined, 'Novo');

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.findAll).toHaveBeenCalledWith(undefined, {
          skip: 0,
          take: 20,
          status: 'Novo',
        });
      });
    });

    describe('updateStatus', () => {
      it('should update order status', async () => {
        // Arrange
        const expectedResult = {
          id: 'order-1',
          status: 'Enviado',
        };
        mockOrdersService.updateStatus.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.updateStatus('order-1', 'Enviado');

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
          'order-1',
          'Enviado',
        );
      });
    });

    describe('update', () => {
      it('should update an order', async () => {
        // Arrange
        const dto: UpdateOrderDto = { shippingAddress: 'New Address' };
        const expectedResult = {
          id: 'order-1',
          shippingAddress: 'New Address',
        };
        mockOrdersService.update.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.update('order-1', dto, adminUser);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.update).toHaveBeenCalledWith('order-1', dto);
      });
    });

    describe('remove', () => {
      it('should delete an order as admin', async () => {
        // Arrange
        const expectedResult = { id: 'order-1' };
        mockOrdersService.remove.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.remove('order-1');

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.remove).toHaveBeenCalledWith('order-1');
      });
    });
  });

  describe('as customer', () => {
    describe('create', () => {
      it('should force create using authenticated user email', async () => {
        // Arrange
        const dto: CreateOrderDto = {
          totalAmount: 150.0,
          order_items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50.0 }],
        };
        const expectedResult = { id: 'order-1', ...dto };
        mockOrdersService.create.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.create(dto, customerUser);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.create).toHaveBeenCalledWith(
          dto,
          'john@example.com',
        );
      });
    });

    describe('findOne', () => {
      it('should throw NotFoundException when order belongs to another customer', async () => {
        // Arrange
        mockOrdersService.findOne.mockResolvedValue({
          id: 'order-1',
          customer: { email: 'other@example.com' },
        });

        // Act & Assert
        await expect(
          controller.findOne('order-1', customerUser),
        ).rejects.toThrow(NotFoundException);
      });

      it('should return the order when it belongs to the customer', async () => {
        // Arrange
        const expectedResult = {
          id: 'order-1',
          customer: { email: 'john@example.com' },
        };
        mockOrdersService.findOne.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.findOne('order-1', customerUser);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.findOne).toHaveBeenCalledWith('order-1');
      });
    });

    describe('cancel', () => {
      it('should cancel the order', async () => {
        // Arrange
        const expectedResult = {
          id: 'order-1',
          status: 'Cancelado',
        };
        mockOrdersService.cancel.mockResolvedValue(expectedResult);

        // Act
        const result = await controller.cancel('order-1', customerUser);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(mockOrdersService.cancel).toHaveBeenCalledWith(
          'order-1',
          'john@example.com',
        );
      });
    });

    describe('update', () => {
      it('should throw NotFoundException for customer update attempts', () => {
        // Arrange & Act & Assert
        expect(() =>
          controller.update(
            'order-1',
            { shippingAddress: 'New Address' },
            customerUser,
          ),
        ).toThrow(NotFoundException);
      });
    });
  });
});
