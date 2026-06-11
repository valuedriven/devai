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
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Query('customerEmail') customerEmail?: string,
  ) {
    // Se não for admin, força o email do próprio usuário
    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const emailToFilter = isAdmin ? customerEmail : userEmail;

    return this.ordersService.findAll(tenantId, emailToFilter);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    console.log('[findOne] ID:', id, 'tenantId:', tenantId);
    let order;
    try {
      order = await this.ordersService.findOne(BigInt(id), tenantId);
      console.log('[findOne] Order found:', {
        id: order?.id?.toString(),
        customerId: order?.customerId?.toString(),
        customerEmail: order?.customers?.email,
      });
    } catch (e) {
      console.error('[findOne] Error in service findOne:', e);
      throw e;
    }

    const isAdmin = this.checkIsAdmin(user);
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    console.log('[findOne] User:', {
      id: user?.id,
      email: userEmail,
      isAdmin,
    });

    if (!isAdmin && order?.customers?.email !== userEmail) {
      console.warn(
        '[findOne] Access denied: order customer email',
        order?.customers?.email,
        'does not match user email',
        userEmail,
      );
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
