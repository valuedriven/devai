import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PrismaService } from '../../../database/prisma.service';
import { OrderStatus } from './order-management.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, customerEmail?: string) {
    const { order_items, customerId, ...orderData } = createOrderDto;

    if (!order_items || order_items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Resolve customer using email if provided, otherwise check customerId
    let resolvedCustomerId = customerId;
    if (customerEmail) {
      const customer = await this.prisma.customer.findUnique({
        where: { email: customerEmail },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer with email ${customerEmail} not found`,
        );
      }
      if (!customer.active) {
        throw new BadRequestException('Customer account is inactive');
      }
      resolvedCustomerId = customer.id;
    } else if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }
      if (!customer.active) {
        throw new BadRequestException('Customer account is inactive');
      }
    } else {
      throw new BadRequestException('Customer information is required');
    }

    // Group duplicate productIds in the input to avoid issues
    const consolidatedItemsMap = new Map<string, number>();
    for (const item of order_items) {
      const currentQty = consolidatedItemsMap.get(item.productId) ?? 0;
      consolidatedItemsMap.set(item.productId, currentQty + item.quantity);
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const [productId, quantity] of consolidatedItemsMap.entries()) {
        if (quantity <= 0) {
          throw new BadRequestException(
            `Quantity for product ${productId} must be greater than 0`,
          );
        }

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        if (!product.active) {
          throw new BadRequestException(`Product ${product.name} is inactive`);
        }

        if (product.stock < quantity) {
          throw new UnprocessableEntityException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
          );
        }

        // Decrement product stock
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * quantity;

        orderItemsData.push({
          productId,
          quantity,
          unitPrice,
        });
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      return tx.order.create({
        data: {
          ...orderData,
          customerId: resolvedCustomerId,
          number: orderNumber,
          totalAmount,
          status: OrderStatus.NEW,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
    });
  }

  async findAll(
    customerEmail?: string,
    options?: { skip?: number; take?: number; status?: string },
  ) {
    const where: { customer?: { email: string }; status?: string } = {};
    if (customerEmail) {
      where.customer = {
        email: customerEmail,
      };
    }
    if (options?.status) {
      where.status = options.status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total };
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
    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    if (status === 'Cancelado' && order.status !== 'Cancelado') {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return tx.order.update({
          where: { id },
          data: { status },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
            customer: true,
          },
        });
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });
  }

  async cancel(id: string, customerEmail?: string) {
    const order = await this.findOne(id);

    if (customerEmail && order.customer?.email !== customerEmail) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== 'Novo') {
      throw new BadRequestException(
        `Cannot cancel order in status ${order.status}`,
      );
    }

    return this.updateStatus(id, 'Cancelado');
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
