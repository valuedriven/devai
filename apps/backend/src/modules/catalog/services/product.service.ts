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
        categoryId: BigInt(categoryId),
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

  async findOne(id: number) {
    return this.prisma.product.findFirst({
      where: { id: BigInt(id) },
      include: { category: true },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { categoryId, ...rest } = updateProductDto;
    return this.prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        ...rest,
        ...(categoryId ? { categoryId: BigInt(categoryId) } : {}),
      },
    });
  }

  async remove(id: number) {
    const bigIntId = BigInt(id);
    const item = await this.prisma.product.findFirst({
      where: { id: bigIntId },
    });
    if (!item) return false;

    await this.prisma.product.delete({ where: { id: bigIntId } });
    return true;
  }
}
