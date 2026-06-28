import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrderManagementService } from './services/order-management.service';
import { PaymentService } from './services/payment.service';
import { OrdersController } from './controllers/orders.controller';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    OrdersController,
    AdminOrdersController,
    AdminPaymentsController,
  ],
  providers: [OrdersService, OrderManagementService, PaymentService],
  exports: [OrdersService, OrderManagementService, PaymentService],
})
export class OrdersModule {}
