import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';
import { Roles } from '../../../core/decorators/roles.decorator';

@ApiTags('categories')
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category successfully created.' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists.',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all categories with pagination and search' })
  @ApiResponse({ status: 200, description: 'List of categories.' })
  async findAll(@Query() query: ListCategoriesQueryDto, @Res() res: Response) {
    const result = await this.categoriesService.findAll(query);

    // Set X-Total-Count header
    res.setHeader('X-Total-Count', result.meta.total);

    return res.status(HttpStatus.OK).json(result.data);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiResponse({ status: 200, description: 'The category details.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({ status: 200, description: 'Category successfully updated.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiResponse({
    status: 204,
    description: 'Category successfully soft deleted or already inactive.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
  }
}
