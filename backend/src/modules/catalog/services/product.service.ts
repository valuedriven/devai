import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto, tenantId: string) {
        const { categoryId, active, ...rest } = createProductDto;
        return this.prisma.product.create({
            data: {
                ...rest,
                active: active ?? true,
                categoryId: BigInt(categoryId),
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId },
            include: { category: true },
        });
    }

    async findAllActive(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId, active: true },
            include: { category: true },
        });
    }

    async findOne(id: number, tenantId: string) {
        return this.prisma.product.findFirst({
            where: { id: BigInt(id), tenantId },
            include: { category: true },
        });
    }

    async update(
        id: number,
        updateProductDto: Partial<CreateProductDto>,
        tenantId: string,
    ) {
        const { categoryId, ...rest } = updateProductDto;
        return this.prisma.product.update({
            where: { id: BigInt(id) },
            data: {
                ...rest,
                ...(categoryId ? { categoryId: BigInt(categoryId) } : {}),
            },
        });
    }

    async remove(id: number, tenantId: string) {
        const bigIntId = BigInt(id);
        const item = await this.prisma.product.findFirst({ where: { id: bigIntId, tenantId } });
        if (!item) return false;

        await this.prisma.product.delete({ where: { id: bigIntId } });
        return true;
    }
}
