import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { PublicProductsController } from './controllers/public-products.controller';
import { PublicCategoriesController } from './controllers/public-categories.controller';
import { ProductsService } from './services/products.service';
import { CategoriesService } from './services/categories.service';

@Module({
  imports: [],
  controllers: [
    ProductsController,
    CategoriesController,
    PublicProductsController,
    PublicCategoriesController,
  ],
  providers: [ProductsService, CategoriesService],
})
export class ProductsModule {}
