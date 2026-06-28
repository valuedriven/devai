import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AdminCreateCategoryDto } from '../dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from '../dto/admin-update-category.dto';
import { AdminListCategoriesQueryDto } from '../dto/admin-list-categories-query.dto';
import { slugify, normalizeName } from '../utils/category.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: AdminCreateCategoryDto) {
    const nameNormalized = normalizeName(createCategoryDto.name);
    const slug = slugify(createCategoryDto.name);

    try {
      return await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          nameNormalized,
          slug,
          active: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 = Unique constraint failed
        if (error.code === 'P2002') {
          throw new ConflictException('Category with this name already exists');
        }
      }
      throw error;
    }
  }

  async findAll(query: AdminListCategoriesQueryDto) {
    const { page = 1, limit = 20, search, includeInactive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    // Filter by active status unless includeInactive is true
    if (!includeInactive) {
      where.active = true;
    }

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: AdminUpdateCategoryDto) {
    // First check if category exists
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const data: Prisma.CategoryUpdateInput = {
      ...updateCategoryDto,
    };

    // Regenerate slug and nameNormalized if name is being updated
    if (updateCategoryDto.name) {
      data.nameNormalized = normalizeName(updateCategoryDto.name);
      data.slug = slugify(updateCategoryDto.name);
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 = Unique constraint failed
        if (error.code === 'P2002') {
          throw new ConflictException('Category with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Soft delete: set active to false
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    // Idempotent: if already inactive, return success
    if (!existing.active) {
      return { success: true, alreadyInactive: true };
    }

    await this.prisma.category.update({
      where: { id },
      data: { active: false },
    });

    return { success: true, alreadyInactive: false };
  }
}
