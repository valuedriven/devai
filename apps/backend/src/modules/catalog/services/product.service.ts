import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryId, active, ...rest } = createProductDto;
    return this.prisma.product.create({
      data: {
        ...rest,
        active: active ?? true,
        ...(categoryId ? { categoryId } : {}),
      },
    });
  }

  async findAll(search?: string, publicView = false) {
    return this.prisma.product.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(publicView ? { active: true, category: { active: true } } : {}),
      },
      include: { category: true },
    });
  }

  async findAllActive(search?: string) {
    return this.prisma.product.findMany({
      where: {
        active: true,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: { category: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, ...rest } = updateProductDto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId ? { categoryId } : {}),
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!item) return false;

    await this.prisma.product.delete({ where: { id } });
    return true;
  }
}
