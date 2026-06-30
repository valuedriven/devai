import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../database/__mocks__/prisma-service.mock';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category with slug and nameNormalized', async () => {
      // Arrange
      const dto = { name: 'Electronics & Gadgets' };
      const expectedResult = {
        id: 'uuid-123',
        name: 'Electronics & Gadgets',
        nameNormalized: 'electronics & gadgets',
        slug: 'electronics-and-gadgets',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.category.create.mockResolvedValueOnce(expectedResult);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Electronics & Gadgets',
          nameNormalized: 'electronics & gadgets',
          slug: 'electronics-and-gadgets',
          active: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException on duplicate name (P2002)', async () => {
      // Arrange
      const dto = { name: 'Electronics' };
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '7.5.0' },
      );

      prisma.category.create.mockRejectedValueOnce(prismaError);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories with default params', async () => {
      // Arrange
      const categories = [
        { id: '1', name: 'Electronics', slug: 'electronics', active: true },
        { id: '2', name: 'Books', slug: 'books', active: true },
      ];

      prisma.category.findMany.mockResolvedValueOnce(categories);
      prisma.category.count.mockResolvedValueOnce(2);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(result.data).toEqual(categories);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by active when includeInactive is false', async () => {
      // Arrange
      prisma.category.findMany.mockResolvedValueOnce([]);
      prisma.category.count.mockResolvedValueOnce(0);

      // Act
      await service.findAll({ includeInactive: false });

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true },
        }),
      );
    });

    it('should not filter by active when includeInactive is true', async () => {
      // Arrange
      prisma.category.findMany.mockResolvedValueOnce([]);
      prisma.category.count.mockResolvedValueOnce(0);

      // Act
      await service.findAll({ includeInactive: true });

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should apply search filter', async () => {
      // Arrange
      prisma.category.findMany.mockResolvedValueOnce([]);
      prisma.category.count.mockResolvedValueOnce(0);

      // Act
      await service.findAll({ search: 'electronics' });

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array) as unknown,
          }) as unknown,
        }),
      );
    });

    it('should handle pagination', async () => {
      // Arrange
      prisma.category.findMany.mockResolvedValueOnce([]);
      prisma.category.count.mockResolvedValueOnce(100);

      // Act
      const result = await service.findAll({ page: 3, limit: 10 });

      // Assert
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      // Arrange
      const category = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      prisma.category.findUnique.mockResolvedValueOnce(category);

      // Act
      const result = await service.findOne('uuid-123');

      // Assert
      expect(result).toEqual(category);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      prisma.category.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      // Arrange
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      const updateDto = { name: 'Consumer Electronics' };
      const updatedCategory = {
        ...existingCategory,
        name: 'Consumer Electronics',
        nameNormalized: 'consumer electronics',
        slug: 'consumer-electronics',
      };

      prisma.category.findUnique.mockResolvedValueOnce(existingCategory);
      prisma.category.update.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await service.update('uuid-123', updateDto);

      // Assert
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: expect.objectContaining({
          name: 'Consumer Electronics',
          nameNormalized: 'consumer electronics',
          slug: 'consumer-electronics',
        }) as unknown,
      });
      expect(result.name).toBe('Consumer Electronics');
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      prisma.category.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.update('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      // Arrange
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '7.5.0' },
      );

      prisma.category.findUnique.mockResolvedValueOnce(existingCategory);
      prisma.category.update.mockRejectedValueOnce(prismaError);

      // Act & Assert
      await expect(
        service.update('uuid-123', { name: 'Existing Name' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating active status only', async () => {
      // Arrange
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      const updatedCategory = { ...existingCategory, active: false };

      prisma.category.findUnique.mockResolvedValueOnce(existingCategory);
      prisma.category.update.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await service.update('uuid-123', { active: false });

      // Assert
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { active: false },
      });
      expect(result.active).toBe(false);
    });
  });

  describe('remove', () => {
    it('should soft delete an active category', async () => {
      // Arrange
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      const updatedCategory = { ...existingCategory, active: false };

      prisma.category.findUnique.mockResolvedValueOnce(existingCategory);
      prisma.category.update.mockResolvedValueOnce(updatedCategory);

      // Act
      const result = await service.remove('uuid-123');

      // Assert
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { active: false },
      });
      expect(result).toEqual({ success: true, alreadyInactive: false });
    });

    it('should be idempotent for already inactive category', async () => {
      // Arrange
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: false,
      };

      prisma.category.findUnique.mockResolvedValueOnce(existingCategory);

      // Act
      const result = await service.remove('uuid-123');

      // Assert
      expect(prisma.category.update).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, alreadyInactive: true });
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      prisma.category.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
