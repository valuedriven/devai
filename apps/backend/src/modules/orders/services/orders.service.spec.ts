import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import type {
  CreateOrderDto,
  CreateOrderItemDto,
} from '../dto/create-order.dto';
import type { UpdateOrderDto } from '../dto/update-order.dto';
import { PrismaService } from '../../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../database/__mocks__/prisma-service.mock';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    // Configure $transaction mock to execute the callback with the mock prisma service
    prisma.$transaction.mockImplementation(
      async (cb: (tx: MockPrismaService) => Promise<unknown>) =>
        await cb(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if order_items is empty or missing', async () => {
      // Act & Assert
      await expect(
        service.create({ totalAmount: 100 } as CreateOrderDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create({ totalAmount: 100, order_items: [] } as CreateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if customerEmail is provided but customer not found', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as CreateOrderDto,
          'notfound@example.com',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if customer is inactive', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'inactive@example.com',
        active: false,
      });

      // Act & Assert
      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as CreateOrderDto,
          'inactive@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as CreateOrderDto,
          'john@example.com',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is inactive', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        name: 'Product 1',
        active: false,
        stock: 10,
        price: 100,
      });

      // Act & Assert
      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as CreateOrderDto,
          'john@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnprocessableEntityException if stock is insufficient', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        name: 'Product 1',
        active: true,
        stock: 2,
        price: 100,
      });

      // Act & Assert
      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 5, unitPrice: 100 }],
          } as CreateOrderDto,
          'john@example.com',
        ),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should create order, decrement stock, and recalculate prices on the server', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        name: 'Product 1',
        active: true,
        stock: 10,
        price: 50.0,
      });

      const orderData = {
        id: 'order-1',
        number: 'ORD-12345',
        customerId: 'cust-1',
        totalAmount: 50.0,
        status: 'Novo',
      };

      prisma.order.create.mockResolvedValueOnce(orderData);

      // Act
      const result = await service.create(
        {
          totalAmount: 999.0, // Client side price that should be ignored
          shippingAddress: 'Rua A, 123',
          order_items: [{ productId: 'p1', quantity: 1, unitPrice: 999.0 }],
        } as CreateOrderDto,
        'john@example.com',
      );

      // Assert
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { decrement: 1 } },
      });
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: 'cust-1',
          totalAmount: 50.0,
          status: 'Novo',
          orderItems: {
            create: [{ productId: 'p1', quantity: 1, unitPrice: 50.0 }],
          },
        }) as unknown,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
      expect(result).toEqual(orderData);
    });

    it('should propagate error when $transaction fails', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      const dbError = new Error('Database connection lost');
      prisma.$transaction.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(
        service.create(
          {
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as CreateOrderDto,
          'john@example.com',
        ),
      ).rejects.toThrow('Database connection lost');
    });
  });

  describe('findAll', () => {
    it('should return all orders without email filter', async () => {
      // Arrange
      const orders = [{ id: 'order-1' }, { id: 'order-2' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);
      prisma.order.count.mockResolvedValueOnce(2);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        skip: undefined,
        take: undefined,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ data: orders, total: 2 });
    });

    it('should filter orders by customer email', async () => {
      // Arrange
      const orders = [{ id: 'order-1' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);
      prisma.order.count.mockResolvedValueOnce(1);

      // Act
      const result = await service.findAll('john@example.com');

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { customer: { email: 'john@example.com' } },
        skip: undefined,
        take: undefined,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ data: orders, total: 1 });
    });

    it('should filter orders by status', async () => {
      // Arrange
      const orders = [{ id: 'order-1' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);
      prisma.order.count.mockResolvedValueOnce(1);

      // Act
      const result = await service.findAll(undefined, { status: 'Novo' });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { status: 'Novo' },
        skip: undefined,
        take: undefined,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ data: orders, total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return an order with full includes', async () => {
      // Arrange
      const order = {
        id: 'order-1',
        orderItems: [{ id: 'item-1', product: { id: 'prod-1' } }],
        customer: { id: 'cust-1' },
      };

      prisma.order.findUnique.mockResolvedValueOnce(order);

      // Act
      const result = await service.findOne('order-1');

      // Assert
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          orderItems: { include: { product: true } },
          customer: true,
        },
      });
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      prisma.order.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the order status', async () => {
      // Arrange
      const existingOrder = { id: 'order-1', status: 'Novo', orderItems: [] };
      const updatedOrder = { ...existingOrder, status: 'Enviado' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await service.updateStatus('order-1', 'Enviado');

      // Assert
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'Enviado' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should restore stock when status transitions to Cancelado', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [
          { productId: 'p1', quantity: 2 },
          { productId: 'p2', quantity: 1 },
        ],
      };
      const updatedOrder = { ...existingOrder, status: 'Cancelado' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await service.updateStatus('order-1', 'Cancelado');

      // Assert
      expect(prisma.product.update).toHaveBeenCalledTimes(2);
      expect(prisma.product.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'p1' },
        data: { stock: { increment: 2 } },
      });
      expect(prisma.product.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'p2' },
        data: { stock: { increment: 1 } },
      });
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('cancel', () => {
    it('should cancel the order if status is Novo', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        customer: { email: 'john@example.com' },
        orderItems: [],
      };
      const updatedOrder = { ...existingOrder, status: 'Cancelado' };

      prisma.order.findUnique.mockResolvedValue(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await service.cancel('order-1', 'john@example.com');

      // Assert
      expect(result.status).toBe('Cancelado');
    });

    it('should throw BadRequestException if order is not in Novo status', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Faturado',
        customer: { email: 'john@example.com' },
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);

      // Act & Assert
      await expect(
        service.cancel('order-1', 'john@example.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should cancel order without customer email check when admin', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        customer: { email: 'other@example.com' },
        orderItems: [],
      };
      const updatedOrder = { ...existingOrder, status: 'Cancelado' };

      prisma.order.findUnique.mockResolvedValue(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await service.cancel('order-1');

      // Assert
      expect(result.status).toBe('Cancelado');
    });

    it('should throw NotFoundException when customer email does not match', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        customer: { email: 'john@example.com' },
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);

      // Act & Assert
      await expect(
        service.cancel('order-1', 'other@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create with customerId', () => {
    it('should resolve customer by customerId when no email is provided', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        name: 'Product 1',
        active: true,
        stock: 10,
        price: 50.0,
      });

      const orderData = {
        id: 'order-1',
        number: 'ORD-12345',
        customerId: 'cust-1',
        totalAmount: 50.0,
        status: 'Novo',
      };
      prisma.order.create.mockResolvedValueOnce(orderData);

      // Act
      const result = await service.create({
        customerId: 'cust-1',
        order_items: [{ productId: 'p1', quantity: 1, unitPrice: 999.0 }],
      } as CreateOrderDto);

      // Assert
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'cust-1' },
      });
      expect(result).toEqual(orderData);
    });
  });

  describe('create with customerId validation', () => {
    it('should throw NotFoundException if customerId is not found', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.create({
          customerId: 'missing-cust',
          order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
        } as CreateOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if customerId is inactive', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'inactive@example.com',
        active: false,
      });

      // Act & Assert
      await expect(
        service.create({
          customerId: 'cust-1',
          order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
        } as CreateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create with duplicate productIds', () => {
    it('should consolidate duplicate items and validate total quantity', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce({
        id: 'p1',
        name: 'Product 1',
        active: true,
        stock: 5,
        price: 50.0,
      });

      const orderData = {
        id: 'order-1',
        number: 'ORD-12345',
        customerId: 'cust-1',
        totalAmount: 150.0,
        status: 'Novo',
      };
      prisma.order.create.mockResolvedValueOnce(orderData);

      // Act
      const result = await service.create(
        {
          order_items: [
            { productId: 'p1', quantity: 1, unitPrice: 50.0 },
            { productId: 'p1', quantity: 2, unitPrice: 50.0 },
          ],
        } as CreateOrderDto,
        'john@example.com',
      );

      // Assert
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { decrement: 3 } },
      });
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 150.0,
            orderItems: {
              create: [{ productId: 'p1', quantity: 3, unitPrice: 50.0 }],
            },
          }) as unknown,
        }),
      );
      expect(result).toEqual(orderData);
    });

    it('should throw BadRequestException when consolidated quantity is zero or negative', async () => {
      // Arrange
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });

      // Act & Assert
      await expect(
        service.create(
          {
            order_items: [{ productId: 'p1', quantity: 0, unitPrice: 50.0 }],
          } as CreateOrderDto,
          'john@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should return order unchanged when new status equals current status', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);

      // Act
      const result = await service.updateStatus('order-1', 'Novo');

      // Assert
      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result).toEqual(existingOrder);
    });

    it('should update status without restoring stock when not transitioning to Cancelado', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [{ productId: 'p1', quantity: 2 }],
      };
      const updatedOrder = { ...existingOrder, status: 'Pago' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await service.updateStatus('order-1', 'Pago');

      // Assert
      expect(prisma.product.update).not.toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'Pago' },
        }),
      );
      expect(result.status).toBe('Pago');
    });
  });

  describe('update', () => {
    it('should update order fields excluding order_items and customerId', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [],
      };
      const updatedOrder = {
        ...existingOrder,
        shippingAddress: 'New Address',
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      const result = await service.update('order-1', {
        order_items: [{ productId: 'p1', quantity: 1 } as CreateOrderItemDto],
        customerId: 'cust-2',
        shippingAddress: 'New Address',
      } as UpdateOrderDto);

      // Assert
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { customerId: 'cust-2', shippingAddress: 'New Address' },
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should preserve customerId when provided in update DTO', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [],
      };
      const updatedOrder = {
        ...existingOrder,
        customerId: 'cust-2',
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      // Act
      await service.update('order-1', {
        customerId: 'cust-2',
      } as UpdateOrderDto);

      // Assert
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { customerId: 'cust-2' },
      });
    });
  });

  describe('remove', () => {
    it('should delete the order after finding it', async () => {
      // Arrange
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.delete.mockResolvedValueOnce(existingOrder);

      // Act
      const result = await service.remove('order-1');

      // Assert
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
      expect(prisma.order.delete).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });
      expect(result).toEqual(existingOrder);
    });
  });
});
