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
import { ProductsService } from '../services/products.service';
import { PublicListProductsQueryDto } from '../dto/public-list-products-query.dto';
import { Public } from '../../../core/decorators/public.decorator';

@ApiTags('storefront-products')
@Controller('products')
@Public()
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active products for the storefront' })
  @ApiResponse({ status: 200, description: 'List of active products.' })
  async findAll(
    @Query() query: PublicListProductsQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.productsService.findAll({
      ...query,
      includeInactive: false, // Ensure inactive products are never returned to the public
    });
    res.setHeader('X-Total-Count', result.meta.total);
    return res.status(HttpStatus.OK).json(result.data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single active product by ID' })
  @ApiResponse({ status: 200, description: 'The product details.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product.active) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
