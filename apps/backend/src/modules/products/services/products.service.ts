import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CategoriesService } from './categories.service';
import { AdminCreateProductDto } from '../dto/admin-create-product.dto';
import { AdminUpdateProductDto } from '../dto/admin-update-product.dto';
import { AdminListProductsQueryDto } from '../dto/admin-list-products-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
  ) {}

  private async validateCategory(categoryId?: string) {
    if (!categoryId) return;
    try {
      const category = await this.categoriesService.findOne(categoryId);
      if (!category.active) {
        throw new BadRequestException(
          'Cannot assign an inactive category to a product',
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Category not found');
      }
      throw error;
    }
  }

  async create(createProductDto: AdminCreateProductDto) {
    await this.validateCategory(createProductDto.categoryId);

    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(query: AdminListProductsQueryDto) {
    const { page = 1, limit = 20, search, categoryId, includeInactive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (!includeInactive) {
      where.active = true;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: AdminUpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.validateCategory(updateProductDto.categoryId);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (!existing.active) {
      return { success: true, alreadyInactive: true };
    }

    await this.prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return { success: true, alreadyInactive: false };
  }
}
