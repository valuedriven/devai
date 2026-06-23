import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    return this.prisma.category.findFirst({
      where: { id: BigInt(id) },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id: BigInt(id) },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    const bigIntId = BigInt(id);
    const item = await this.prisma.category.findFirst({
      where: { id: bigIntId },
    });
    if (!item) return false;

    await this.prisma.category.delete({ where: { id: bigIntId } });
    return true;
  }
}
