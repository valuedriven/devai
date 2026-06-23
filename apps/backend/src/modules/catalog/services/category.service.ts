import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { slugify, normalizeName } from '../../categories/utils/category.utils';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const nameNormalized = normalizeName(createCategoryDto.name);
    const slug = slugify(createCategoryDto.name);
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        nameNormalized,
        slug,
        active: createCategoryDto.active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { active: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const data: any = { ...updateCategoryDto };
    if (updateCategoryDto.name) {
      data.nameNormalized = normalizeName(updateCategoryDto.name);
      data.slug = slugify(updateCategoryDto.name);
    }
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const item = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!item) return false;

    // Soft delete
    await this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
    return true;
  }
}
