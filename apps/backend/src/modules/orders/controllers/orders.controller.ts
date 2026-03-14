import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { TenantId } from '../../../core/decorators/tenant-id.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';

@Controller('orders')
@UseGuards(AuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @TenantId() tenantId: string) {
    return this.ordersService.create(createOrderDto, tenantId);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Query('customerEmail') customerEmail?: string,
  ) {
    // Se não for admin, força o email do próprio usuário
    const isAdmin = user?.publicMetadata?.role === 'admin';
    const emailToFilter = isAdmin ? customerEmail : user.email;

    return this.ordersService.findAll(tenantId, emailToFilter);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.findOne(BigInt(id), tenantId);

    // Se não for admin, verifica se o pedido pertence ao usuário
    const isAdmin = user?.publicMetadata?.role === 'admin';
    if (!isAdmin && order.customers?.email !== user.email) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.updateStatus(BigInt(id), status, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.update(BigInt(id), updateOrderDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.remove(BigInt(id), tenantId);
  }
}
