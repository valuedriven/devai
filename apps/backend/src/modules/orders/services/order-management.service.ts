import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

export enum OrderStatus {
  NEW = 'Novo',
  PAID = 'Pago',
  PREPARATION = 'Preparação',
  INVOICED = 'Faturado',
  SHIPPED = 'Despachado',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado',
}

@Injectable()
export class OrderManagementService {
  readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.NEW]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.PREPARATION, OrderStatus.CANCELLED],
    [OrderStatus.PREPARATION]: [OrderStatus.INVOICED, OrderStatus.CANCELLED],
    [OrderStatus.INVOICED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.DELIVERED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filters: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.order.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { entityId: id, entityType: 'Order' },
      orderBy: { createdAt: 'desc' },
    });

    return { ...order, auditLogs };
  }

  async transitionStatus(
    id: string,
    newStatus: OrderStatus,
    userId?: string,
    notes?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const currentStatus = order.status as OrderStatus;

    if (!this.canTransition(currentStatus, newStatus)) {
      throw new UnprocessableEntityException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });

    this.eventEmitter.emit('audit.log', {
      entityType: 'Order',
      entityId: id,
      action: 'STATUS_CHANGE',
      userId,
      payload: {
        from: currentStatus,
        to: newStatus,
        notes,
      },
    });

    return updatedOrder;
  }

  private canTransition(from: OrderStatus, to: OrderStatus): boolean {
    if (from === to) return true;
    const allowed = this.validTransitions[from] || [];
    return allowed.includes(to);
  }
}
