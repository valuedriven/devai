import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { SyncCustomerDto } from '../dto/sync-customer.dto';
import { Roles } from '../../../core/decorators/roles.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('admin')
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Post('sync')
  syncCustomer(@Body() syncCustomerDto: SyncCustomerDto) {
    return this.customersService.syncCustomer(
      syncCustomerDto.email,
      syncCustomerDto.name,
    );
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Roles('admin')
  @Get('active')
  findAllActive() {
    return this.customersService.findAllActive();
  }

  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
