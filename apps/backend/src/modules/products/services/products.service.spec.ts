import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../../database/prisma.service';
import { CategoriesService } from './categories.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../database/__mocks__/prisma-service.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: MockPrismaService;

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

  const mockCategoriesService = {
    findOne: jest.fn().mockResolvedValue(mockCategory),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as unknown as MockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a product', async () => {
      // Arrange
      const dto = {
        name: 'Test Product',
        price: 10.0,
        stock: 100,
        categoryId: 'cat-123',
      };
      prisma.product.create.mockResolvedValueOnce(mockProduct);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('cat-123');
      expect(prisma.product.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException if category is not found', async () => {
      // Arrange
      const dto = {
        name: 'Test Product',
        price: 10.0,
        stock: 100,
        categoryId: 'cat-123',
      };
      mockCategoriesService.findOne.mockRejectedValueOnce(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if category is inactive', async () => {
      // Arrange
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

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      // Arrange
      prisma.product.findMany.mockResolvedValueOnce([mockProduct]);
      prisma.product.count.mockResolvedValueOnce(1);

      // Act
      const result = await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toEqual([mockProduct]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      // Arrange
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);

      // Act
      const result = await service.findOne('prod-123');

      // Assert
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      prisma.product.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findOne('prod-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a product', async () => {
      // Arrange
      const dto = { price: 20.0 };
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);
      prisma.product.update.mockResolvedValueOnce(mockProduct);

      // Act
      const result = await service.update('prod-123', dto);

      // Assert
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product to update does not exist', async () => {
      // Arrange
      prisma.product.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.update('prod-123', { price: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      // Arrange
      prisma.product.findUnique.mockResolvedValueOnce(mockProduct);
      prisma.product.update.mockResolvedValueOnce(mockProduct);

      // Act
      const result = await service.remove('prod-123');

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-123' },
        data: { active: false },
      });
    });

    it('should return alreadyInactive if product is already inactive', async () => {
      // Arrange
      prisma.product.findUnique.mockResolvedValueOnce({
        ...mockProduct,
        active: false,
      });

      // Act
      const result = await service.remove('prod-123');

      // Assert
      expect(result.alreadyInactive).toBe(true);
    });

    it('should throw NotFoundException if product to remove does not exist', async () => {
      // Arrange
      prisma.product.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.remove('prod-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
