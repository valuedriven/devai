import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, tenantId: string) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
    });
  }

  async findOne(id: number, tenantId: string) {
    return this.prisma.category.findFirst({
      where: { id: BigInt(id), tenantId },
    });
  }

  async update(
    id: number,
    updateCategoryDto: Partial<CreateCategoryDto>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tenantId: string,
  ) {
    return this.prisma.category.update({
      where: { id: BigInt(id) },
      data: updateCategoryDto,
    });
  }

  async remove(id: number, tenantId: string) {
    const bigIntId = BigInt(id);
    const item = await this.prisma.category.findFirst({
      where: { id: bigIntId, tenantId },
    });
    if (!item) return false;

    await this.prisma.category.delete({ where: { id: bigIntId } });
    return true;
  }
}
