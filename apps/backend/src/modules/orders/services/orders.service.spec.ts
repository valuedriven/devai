import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
    it('should create an order with order items', async () => {
      const dto = {
        customerId: 'cust-1',
        totalAmount: 150.0,
        shippingAddress: 'Rua A, 123',
        order_items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 50.0 },
          { productId: 'prod-2', quantity: 1, unitPrice: 50.0 },
        ],
      };

      const expectedOrder = {
        id: 'order-uuid',
        ...dto,
        orderItems: [
          { id: 'item-1', productId: 'prod-1', quantity: 2, unitPrice: 50.0 },
          { id: 'item-2', productId: 'prod-2', quantity: 1, unitPrice: 50.0 },
        ],
        customer: { id: 'cust-1' },
      };

      prisma.order.create.mockResolvedValueOnce(expectedOrder);

      const result = await service.create(dto as any);

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          customerId: 'cust-1',
          totalAmount: 150.0,
          shippingAddress: 'Rua A, 123',
          orderItems: {
            create: [
              { productId: 'prod-1', quantity: 2, unitPrice: 50.0 },
              { productId: 'prod-2', quantity: 1, unitPrice: 50.0 },
            ],
          },
        },
        include: { orderItems: true, customer: true },
      });
      expect(result).toEqual(expectedOrder);
    });

    it('should create an order without order items', async () => {
      const dto = { customerId: 'cust-1', totalAmount: 100.0 };
      const expectedOrder = {
        id: 'order-uuid',
        customerId: 'cust-1',
        totalAmount: 100.0,
      };

      prisma.order.create.mockResolvedValueOnce(expectedOrder);

      const result = await service.create(dto as any);

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: { customerId: 'cust-1', totalAmount: 100.0 },
        include: { orderItems: true, customer: true },
      });
      expect(result).toEqual(expectedOrder);
    });
  });

  describe('findAll', () => {
    it('should return all orders without email filter', async () => {
      const orders = [{ id: 'order-1' }, { id: 'order-2' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);

      const result = await service.findAll();

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        include: { customer: true, orderItems: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(orders);
    });

    it('should filter orders by customer email', async () => {
      const orders = [{ id: 'order-1' }];

      prisma.order.findMany.mockResolvedValueOnce(orders);

      const result = await service.findAll('john@example.com');

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { customer: { email: 'john@example.com' } },
        include: { customer: true, orderItems: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(orders);
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
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Order with ID non-existent not found',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the order status', async () => {
      const existingOrder = { id: 'order-1', status: 'Novo' };
      const updatedOrder = { ...existingOrder, status: 'Enviado' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.updateStatus('order-1', 'Enviado');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          orderItems: { include: { product: true } },
          customer: true,
        },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'Enviado' },
        include: { orderItems: true, customer: true },
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateStatus('non-existent', 'Enviado'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update order without order_items and customerId', async () => {
      const existingOrder = { id: 'order-1', shippingAddress: 'Old Address' };
      const updateDto = {
        shippingAddress: 'New Address',
        order_items: [{ productId: 'prod-1', quantity: 1, unitPrice: 10.0 }],
        customerId: 'new-cust',
      };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.update.mockResolvedValueOnce({
        ...existingOrder,
        shippingAddress: 'New Address',
      });

      const result = await service.update('order-1', updateDto as any);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          orderItems: { include: { product: true } },
          customer: true,
        },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { shippingAddress: 'New Address', customerId: 'new-cust' },
      });
      expect(result.shippingAddress).toBe('New Address');
    });

    it('should throw NotFoundException when order to update not found', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      const existingOrder = { id: 'order-1' };

      prisma.order.findUnique.mockResolvedValueOnce(existingOrder);
      prisma.order.delete.mockResolvedValueOnce(existingOrder);

      const result = await service.remove('order-1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          orderItems: { include: { product: true } },
          customer: true,
        },
      });
      expect(prisma.order.delete).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });
      expect(result).toEqual(existingOrder);
    });

    it('should throw NotFoundException when order to remove not found', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
