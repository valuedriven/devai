import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';

@Module({
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService],
})
export class CatalogModule {}
