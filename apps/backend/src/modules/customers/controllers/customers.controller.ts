import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { SyncCustomerDto } from '../dto/sync-customer.dto';
import { TenantId } from '../../../core/decorators/tenant-id.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.create(createCustomerDto, tenantId);
  }

  @Post('sync')
  syncCustomer(
    @Body() syncCustomerDto: SyncCustomerDto,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.syncCustomer(
      syncCustomerDto.email,
      syncCustomerDto.name,
      tenantId,
    );
  }

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.customersService.findAll(tenantId);
  }

  @Get('active')
  findAllActive(@TenantId() tenantId: string) {
    return this.customersService.findAllActive(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const bigIntId = /^\d+$/.test(id) ? BigInt(id) : BigInt(0);
    return this.customersService.findOne(bigIntId, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @TenantId() tenantId: string,
  ) {
    const bigIntId = /^\d+$/.test(id) ? BigInt(id) : BigInt(0);
    return this.customersService.update(bigIntId, updateCustomerDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    const bigIntId = /^\d+$/.test(id) ? BigInt(id) : BigInt(0);
    return this.customersService.remove(bigIntId, tenantId);
  }
}
