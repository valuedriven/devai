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
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { TenantId } from '../../../core/decorators/tenant-id.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @TenantId() tenantId: string,
  ) {
    return this.categoryService.create(createCategoryDto, tenantId);
  }

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.categoryService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoryService.findOne(+id, tenantId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
    @TenantId() tenantId: string,
  ) {
    return this.categoryService.update(+id, updateCategoryDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoryService.remove(+id, tenantId);
  }
}
