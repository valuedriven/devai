import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { OrderStatus } from './order-management.service';

export enum PaymentStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  REFUNDED = 'Refunded',
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filters: { orderId?: string; status?: string }) {
    const where: any = {};
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.status) where.status = filters.status;

    return this.prisma.payment.findMany({
      where,
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async register(
    data: {
      orderId: string;
      value: number;
      method: string;
      date: string;
      notes?: string;
      status?: PaymentStatus;
    },
    userId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.orderId} not found`);
    }

    const paymentStatus = data.status || PaymentStatus.CONFIRMED;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: data.orderId,
          value: data.value,
          method: data.method,
          date: new Date(data.date),
          notes: data.notes,
          status: paymentStatus,
        },
      });

      this.eventEmitter.emit('audit.log', {
        entityType: 'Payment',
        entityId: payment.id,
        action: 'PAYMENT_REGISTERED',
        userId,
        payload: {
          orderId: data.orderId,
          value: data.value,
          status: paymentStatus,
        },
      });

      if (
        paymentStatus === PaymentStatus.CONFIRMED &&
        order.status === 'Novo'
      ) {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: OrderStatus.PAID },
        });

        this.eventEmitter.emit('audit.log', {
          entityType: 'Order',
          entityId: data.orderId,
          action: 'STATUS_CHANGE',
          userId,
          payload: {
            from: order.status,
            to: OrderStatus.PAID,
            notes: 'Auto-transitioned via payment confirmation',
          },
        });
      }

      return payment;
    });
  }

  async updateStatus(id: string, status: PaymentStatus, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const previousStatus = payment.status;

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status },
      });

      this.eventEmitter.emit('audit.log', {
        entityType: 'Payment',
        entityId: id,
        action: 'STATUS_CHANGE',
        userId,
        payload: {
          from: previousStatus,
          to: status,
        },
      });

      if (
        status === PaymentStatus.CONFIRMED &&
        payment.order.status === 'Novo'
      ) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID },
        });

        this.eventEmitter.emit('audit.log', {
          entityType: 'Order',
          entityId: payment.orderId,
          action: 'STATUS_CHANGE',
          userId,
          payload: {
            from: payment.order.status,
            to: OrderStatus.PAID,
            notes: 'Auto-transitioned via payment update',
          },
        });
      }

      return updatedPayment;
    });
  }
}
