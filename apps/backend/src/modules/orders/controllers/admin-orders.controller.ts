import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderManagementService } from '../services/order-management.service';
import { PaymentService } from '../services/payment.service';
import { AdminListOrdersQueryDto } from '../dto/admin-list-orders-query.dto';
import { OrderStatusTransitionDto } from '../dto/order-status-transition.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { AuthUser } from '../../../core/auth/interfaces/auth-user.interface';

@ApiTags('admin-orders')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly orderManagementService: OrderManagementService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('config/transitions')
  @Roles('admin')
  @ApiOperation({ summary: 'Get valid order status transitions' })
  getTransitions() {
    return this.orderManagementService.validTransitions;
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all orders for admin' })
  @ApiResponse({ status: 200, description: 'List of orders.' })
  findAll(@Query() query: AdminListOrdersQueryDto) {
    return this.orderManagementService.findAll(query);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get order details for admin' })
  @ApiResponse({ status: 200, description: 'Order details.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id') id: string) {
    return this.orderManagementService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Transition order status' })
  @ApiResponse({ status: 200, description: 'Order status updated.' })
  @ApiResponse({ status: 422, description: 'Invalid transition.' })
  transitionStatus(
    @Param('id') id: string,
    @Body() transitionDto: OrderStatusTransitionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.orderManagementService.transitionStatus(
      id,
      transitionDto.status,
      user.clerkId,
      transitionDto.notes,
    );
  }

  @Post(':id/payments')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a manual payment for an order' })
  @ApiResponse({ status: 201, description: 'Payment registered.' })
  registerPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentService.register(
      {
        orderId: id,
        ...createPaymentDto,
      },
      user.clerkId,
    );
  }
}
