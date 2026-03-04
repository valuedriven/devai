import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, tenantId: string) {
    const { order_items, customerId, ...orderData } = createOrderDto;

    return this.prisma.orders.create({
      data: {
        ...orderData,
        customerId: customerId ? BigInt(customerId) : null,
        tenantId,
        order_items: order_items
          ? {
              create: order_items.map((item) => ({
                productId: BigInt(item.productId),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tenantId,
              })),
            }
          : undefined,
      },
      include: {
        order_items: true,
        customers: true,
      },
    });
  }

  async findAll(tenantId: string, customerEmail?: string) {
    const where: { tenantId: string; customers?: { email: string } } = {
      tenantId,
    };
    if (customerEmail) {
      where.customers = {
        email: customerEmail,
      };
    }

    return this.prisma.orders.findMany({
      where,
      include: {
        customers: true,
        order_items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: bigint, tenantId: string) {
    const order = await this.prisma.orders.findFirst({
      where: { id, tenantId },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
        customers: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: bigint, status: string, tenantId: string) {
    await this.findOne(id, tenantId); // verify exists

    return this.prisma.orders.update({
      where: { id },
      data: { status },
      include: {
        order_items: true,
        customers: true,
      },
    });
  }

  async update(id: bigint, updateOrderDto: UpdateOrderDto, tenantId: string) {
    await this.findOne(id, tenantId); // verify exists

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { order_items: _, customerId, ...orderData } = updateOrderDto;

    return this.prisma.orders.update({
      where: { id },
      data: {
        ...orderData,
        customerId: customerId ? BigInt(customerId) : undefined,
      },
    });
  }

  async remove(id: bigint, tenantId: string) {
    await this.findOne(id, tenantId); // verify exists

    return this.prisma.orders.delete({
      where: { id },
    });
  }
}
