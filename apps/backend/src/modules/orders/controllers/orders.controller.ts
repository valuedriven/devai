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
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
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
  findAll(
    @CurrentUser() user: any,
    @Query('customerEmail') customerEmail?: string,
  ) {
    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const emailToFilter = isAdmin ? customerEmail : userEmail;

    return this.ordersService.findAll(emailToFilter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(BigInt(id));

    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!isAdmin && order?.customer?.email !== userEmail) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(BigInt(id), status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(BigInt(id), updateOrderDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(BigInt(id));
  }
}
