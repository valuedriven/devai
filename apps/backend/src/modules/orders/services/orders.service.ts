import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { order_items, ...orderData } = createOrderDto;

    return this.prisma.order.create({
      data: {
        ...orderData,
        orderItems: order_items
          ? {
              create: order_items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            }
          : undefined,
      } as any,
      include: {
        orderItems: true,
        customer: true,
      },
    });
  }

  async findAll(customerEmail?: string) {
    const where: { customer?: { email: string } } = {};
    if (customerEmail) {
      where.customer = {
        email: customerEmail,
      };
    }

    return this.prisma.order.findMany({
      where,
      include: {
        customer: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: true,
        customer: true,
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { order_items: _, customerId, ...orderData } = updateOrderDto;

    return this.prisma.order.update({
      where: { id },
      data: {
        ...orderData,
        customerId: customerId ?? undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
