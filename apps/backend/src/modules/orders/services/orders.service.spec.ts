import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
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
    prisma.$transaction.mockImplementation(async (cb) => cb(prisma));

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if order_items is empty or missing', async () => {
      await expect(service.create({ totalAmount: 100 } as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.create({ totalAmount: 100, order_items: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if customerEmail is provided but customer not found', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as any,
          'notfound@example.com',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if customer is inactive', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'inactive@example.com',
        active: false,
      });

      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as any,
          'inactive@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product is not found', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });
      prisma.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as any,
          'john@example.com',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is inactive', async () => {
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

      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
          } as any,
          'john@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnprocessableEntityException if stock is insufficient', async () => {
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

      await expect(
        service.create(
          {
            totalAmount: 100,
            order_items: [{ productId: 'p1', quantity: 5, unitPrice: 100 }],
          } as any,
          'john@example.com',
        ),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should create order, decrement stock, and recalculate prices on the server', async () => {
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

      const result = await service.create(
        {
          totalAmount: 999.0, // Client side price that should be ignored
          shippingAddress: 'Rua A, 123',
          order_items: [{ productId: 'p1', quantity: 1, unitPrice: 999.0 }],
        } as any,
        'john@example.com',
      );

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
        }),
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
  });

  describe('findAll', () => {
    it('should return all orders without email filter', async () => {
      const orders = [{ id: 'order-1' }, { id: 'order-2' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);
      prisma.order.count.mockResolvedValueOnce(2);

      const result = await service.findAll();

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
      const orders = [{ id: 'order-1' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);
      prisma.order.count.mockResolvedValueOnce(1);

      const result = await service.findAll('john@example.com');

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
      const orders = [{ id: 'order-1' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);
      prisma.order.count.mockResolvedValueOnce(1);

      const result = await service.findAll(undefined, { status: 'Novo' });

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
      const order = {
        id: 'order-1',
        orderItems: [{ id: 'item-1', product: { id: 'prod-1' } }],
        customer: { id: 'cust-1' },
      };

      prisma.order.findUnique.mockResolvedValueOnce(order);

      const result = await service.findOne('order-1');

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
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the order status', async () => {
      const existingOrder = { id: 'order-1', status: 'Novo', orderItems: [] };
      const updatedOrder = { ...existingOrder, status: 'Enviado' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.updateStatus('order-1', 'Enviado');

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

      const result = await service.updateStatus('order-1', 'Cancelado');

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
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        customer: { email: 'john@example.com' },
        orderItems: [],
      };
      const updatedOrder = { ...existingOrder, status: 'Cancelado' };

      prisma.order.findUnique.mockImplementation(async () => existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.cancel('order-1', 'john@example.com');

      expect(result.status).toBe('Cancelado');
    });

    it('should throw BadRequestException if order is not in Novo status', async () => {
      const existingOrder = {
        id: 'order-1',
        status: 'Faturado',
        customer: { email: 'john@example.com' },
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);

      await expect(
        service.cancel('order-1', 'john@example.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should cancel order without customer email check when admin', async () => {
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        customer: { email: 'other@example.com' },
        orderItems: [],
      };
      const updatedOrder = { ...existingOrder, status: 'Cancelado' };

      prisma.order.findUnique.mockImplementation(async () => existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.cancel('order-1');

      expect(result.status).toBe('Cancelado');
    });

    it('should throw NotFoundException when customer email does not match', async () => {
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        customer: { email: 'john@example.com' },
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);

      await expect(
        service.cancel('order-1', 'other@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create with customerId', () => {
    it('should resolve customer by customerId when no email is provided', async () => {
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

      const result = await service.create({
        customerId: 'cust-1',
        order_items: [{ productId: 'p1', quantity: 1, unitPrice: 999.0 }],
      } as any);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'cust-1' },
      });
      expect(result).toEqual(orderData);
    });
  });

  describe('create with customerId validation', () => {
    it('should throw NotFoundException if customerId is not found', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({
          customerId: 'missing-cust',
          order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if customerId is inactive', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'inactive@example.com',
        active: false,
      });

      await expect(
        service.create({
          customerId: 'cust-1',
          order_items: [{ productId: 'p1', quantity: 1, unitPrice: 100 }],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create with duplicate productIds', () => {
    it('should consolidate duplicate items and validate total quantity', async () => {
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

      const result = await service.create(
        {
          order_items: [
            { productId: 'p1', quantity: 1, unitPrice: 50.0 },
            { productId: 'p1', quantity: 2, unitPrice: 50.0 },
          ],
        } as any,
        'john@example.com',
      );

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
          }),
        }),
      );
      expect(result).toEqual(orderData);
    });

    it('should throw BadRequestException when consolidated quantity is zero or negative', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce({
        id: 'cust-1',
        email: 'john@example.com',
        active: true,
      });

      await expect(
        service.create(
          {
            order_items: [{ productId: 'p1', quantity: 0, unitPrice: 50.0 }],
          } as any,
          'john@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should return order unchanged when new status equals current status', async () => {
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);

      const result = await service.updateStatus('order-1', 'Novo');

      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result).toEqual(existingOrder);
    });

    it('should update status without restoring stock when not transitioning to Cancelado', async () => {
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [{ productId: 'p1', quantity: 2 }],
      };
      const updatedOrder = { ...existingOrder, status: 'Pago' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.updateStatus('order-1', 'Pago');

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

      const result = await service.update('order-1', {
        order_items: [{ productId: 'p1', quantity: 1 } as any],
        customerId: 'cust-2',
        shippingAddress: 'New Address',
      } as any);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { customerId: 'cust-2', shippingAddress: 'New Address' },
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should preserve customerId when provided in update DTO', async () => {
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

      await service.update('order-1', { customerId: 'cust-2' } as any);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { customerId: 'cust-2' },
      });
    });
  });

  describe('remove', () => {
    it('should delete the order after finding it', async () => {
      const existingOrder = {
        id: 'order-1',
        status: 'Novo',
        orderItems: [],
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.delete.mockResolvedValueOnce(existingOrder);

      const result = await service.remove('order-1');

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
