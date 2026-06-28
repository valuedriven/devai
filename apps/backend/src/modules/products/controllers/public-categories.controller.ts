import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { PublicListCategoriesQueryDto } from '../dto/public-list-categories-query.dto';
import { Public } from '../../../core/decorators/public.decorator';

@ApiTags('storefront-categories')
@Controller('categories')
@Public()
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active categories for the storefront' })
  @ApiResponse({ status: 200, description: 'List of active categories.' })
  async findAll(
    @Query() query: PublicListCategoriesQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.categoriesService.findAll({
      ...query,
      includeInactive: false,
    });
    res.setHeader('X-Total-Count', result.meta.total);
    return res.status(HttpStatus.OK).json(result.data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single active category by ID' })
  @ApiResponse({ status: 200, description: 'The category details.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category.active) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
