import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { TenantId } from '../../../core/decorators/tenant-id.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
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
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
    @TenantId() tenantId: string,
  ) {
    return this.categoryService.update(+id, updateCategoryDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoryService.remove(+id, tenantId);
  }
}
