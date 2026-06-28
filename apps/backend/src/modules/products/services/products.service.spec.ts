/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../../database/prisma.service';
import { CategoriesService } from './categories.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let categoriesService: CategoriesService;

  const mockProduct = {
    id: 'prod-123',
    name: 'Test Product',
    description: 'Test Description',
    price: new Prisma.Decimal(10.0),
    stock: 100,
    imageUrl: null,
    active: true,
    categoryId: 'cat-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = {
    id: 'cat-123',
    name: 'Test Category',
    nameNormalized: 'test-category',
    slug: 'test-category',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    product: {
      create: jest.fn().mockResolvedValue(mockProduct),
      findMany: jest.fn().mockResolvedValue([mockProduct]),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn().mockResolvedValue(mockProduct),
      update: jest.fn().mockResolvedValue(mockProduct),
    },
  };

  const mockCategoriesService = {
    findOne: jest.fn().mockResolvedValue(mockCategory),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    categoriesService = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a product', async () => {
      const dto = {
        name: 'Test Product',
        price: 10.0,
        stock: 100,
        categoryId: 'cat-123',
      };
      const result = await service.create(dto);
      expect(categoriesService.findOne).toHaveBeenCalledWith('cat-123');
      expect(prismaService.product.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException if category is not found', async () => {
      const dto = {
        name: 'Test Product',
        price: 10.0,
        stock: 100,
        categoryId: 'cat-123',
      };
      mockCategoriesService.findOne.mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if category is inactive', async () => {
      const dto = {
        name: 'Test Product',
        price: 10.0,
        stock: 100,
        categoryId: 'cat-123',
      };
      mockCategoriesService.findOne.mockResolvedValueOnce({
        ...mockCategory,
        active: false,
      });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockProduct]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const result = await service.findOne('prod-123');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);
      await expect(service.findOne('prod-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a product', async () => {
      const dto = { price: 20.0 };
      const result = await service.update('prod-123', dto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product to update does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);
      await expect(service.update('prod-123', { price: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const result = await service.remove('prod-123');
      expect(result.success).toBe(true);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-123' },
        data: { active: false },
      });
    });

    it('should return alreadyInactive if product is already inactive', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce({
        ...mockProduct,
        active: false,
      });
      const result = await service.remove('prod-123');
      expect(result.alreadyInactive).toBe(true);
    });

    it('should throw NotFoundException if product to remove does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);
      await expect(service.remove('prod-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
