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

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!isAdmin) {
      return this.ordersService.create(createOrderDto, userEmail);
    }

    return this.ordersService.create(
      createOrderDto,
      createOrderDto.customerId ? undefined : userEmail,
    );
  }

  private checkIsAdmin(user: any): boolean {
    const metadata = user?.publicMetadata || {};
    let roles: string[] = [];
    if (Array.isArray(metadata.roles)) {
      roles = metadata.roles;
    } else if (typeof metadata.roles === 'string') {
      roles = [metadata.roles];
    } else if (Array.isArray(metadata.role)) {
      roles = metadata.role;
    } else if (typeof metadata.role === 'string') {
      roles = [metadata.role];
    }
    return roles.includes('admin');
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('customerEmail') customerEmail?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
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
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(id);

    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!isAdmin && order?.customer?.email !== userEmail) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

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
    @CurrentUser() user: any,
  ) {
    const isAdmin = this.checkIsAdmin(user);
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
