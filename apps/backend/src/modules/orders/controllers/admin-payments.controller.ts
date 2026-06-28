import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { Roles } from '../../../core/decorators/roles.decorator';

@ApiTags('admin-payments')
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all payments for admin' })
  @ApiResponse({ status: 200, description: 'List of payments.' })
  async findAll(
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentService.findAll({ orderId, status });
  }
}
