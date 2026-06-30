import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import type { AuthUser } from '../../../core/auth/interfaces/auth-user.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    const userEmail = user.email;

    if (!isAdmin) {
      return this.ordersService.create(createOrderDto, userEmail);
    }

    return this.ordersService.create(
      createOrderDto,
      createOrderDto.customerId ? undefined : userEmail,
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('customerEmail') customerEmail?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isAdmin = user.role === 'ADMIN';
    const userEmail = user.email;
    const emailToFilter = isAdmin ? customerEmail : userEmail;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    return this.ordersService.findAll(emailToFilter, {
      skip,
      take: limitNum,
      status,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const order = await this.ordersService.findOne(id);

    const isAdmin = user.role === 'ADMIN';
    const userEmail = user.email;

    if (!isAdmin && order?.customer?.email !== userEmail) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const isAdmin = user.role === 'ADMIN';
    const userEmail = user.email;

    return this.ordersService.cancel(id, isAdmin ? undefined : userEmail);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = user.role === 'ADMIN';
    if (!isAdmin) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
