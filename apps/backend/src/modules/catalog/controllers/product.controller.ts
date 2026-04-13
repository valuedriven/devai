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
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { TenantId } from '../../../core/decorators/tenant-id.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @Body() createProductDto: CreateProductDto,
    @TenantId() tenantId: string,
  ) {
    return this.productService.create(createProductDto, tenantId);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.productService.findAll(tenantId, search);
  }

  @Get('active')
  findAllActive(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAllActive(tenantId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productService.findOne(+id, tenantId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @TenantId() tenantId: string,
  ) {
    return this.productService.update(+id, updateProductDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productService.remove(+id, tenantId);
  }
}
