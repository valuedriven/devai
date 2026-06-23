import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category with slug and nameNormalized', async () => {
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

      mockPrismaService.category.create.mockResolvedValueOnce(expectedResult);

      const result = await service.create(dto);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
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
      const dto = { name: 'Electronics' };
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '7.5.0' },
      );

      mockPrismaService.category.create.mockRejectedValueOnce(prismaError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw specific message on ConflictException', async () => {
      const dto = { name: 'Electronics' };
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '7.5.0' },
      );

      mockPrismaService.category.create.mockRejectedValueOnce(prismaError);

      await expect(service.create(dto)).rejects.toThrow(
        'Category with this name already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated categories with default params', async () => {
      const categories = [
        { id: '1', name: 'Electronics', slug: 'electronics', active: true },
        { id: '2', name: 'Books', slug: 'books', active: true },
      ];

      mockPrismaService.category.findMany.mockResolvedValueOnce(categories);
      mockPrismaService.category.count.mockResolvedValueOnce(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(categories);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by active when includeInactive is false', async () => {
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      mockPrismaService.category.count.mockResolvedValueOnce(0);

      await service.findAll({ includeInactive: false });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true },
        }),
      );
    });

    it('should not filter by active when includeInactive is true', async () => {
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      mockPrismaService.category.count.mockResolvedValueOnce(0);

      await service.findAll({ includeInactive: true });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should apply search filter', async () => {
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      mockPrismaService.category.count.mockResolvedValueOnce(0);

      await service.findAll({ search: 'electronics' });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should handle pagination', async () => {
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      mockPrismaService.category.count.mockResolvedValueOnce(100);

      const result = await service.findAll({ page: 3, limit: 10 });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
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
      const category = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      mockPrismaService.category.findUnique.mockResolvedValueOnce(category);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(category);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
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

      mockPrismaService.category.findUnique.mockResolvedValueOnce(
        existingCategory,
      );
      mockPrismaService.category.update.mockResolvedValueOnce(updatedCategory);

      const result = await service.update('uuid-123', updateDto);

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: expect.objectContaining({
          name: 'Consumer Electronics',
          nameNormalized: 'consumer electronics',
          slug: 'consumer-electronics',
        }),
      });
      expect(result.name).toBe('Consumer Electronics');
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
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

      mockPrismaService.category.findUnique.mockResolvedValueOnce(
        existingCategory,
      );
      mockPrismaService.category.update.mockRejectedValueOnce(prismaError);

      await expect(
        service.update('uuid-123', { name: 'Existing Name' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating active status only', async () => {
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      const updatedCategory = { ...existingCategory, active: false };

      mockPrismaService.category.findUnique.mockResolvedValueOnce(
        existingCategory,
      );
      mockPrismaService.category.update.mockResolvedValueOnce(updatedCategory);

      const result = await service.update('uuid-123', { active: false });

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { active: false },
      });
      expect(result.active).toBe(false);
    });
  });

  describe('remove', () => {
    it('should soft delete an active category', async () => {
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: true,
      };

      const updatedCategory = { ...existingCategory, active: false };

      mockPrismaService.category.findUnique.mockResolvedValueOnce(
        existingCategory,
      );
      mockPrismaService.category.update.mockResolvedValueOnce(updatedCategory);

      const result = await service.remove('uuid-123');

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { active: false },
      });
      expect(result).toEqual({ success: true, alreadyInactive: false });
    });

    it('should be idempotent for already inactive category', async () => {
      const existingCategory = {
        id: 'uuid-123',
        name: 'Electronics',
        slug: 'electronics',
        active: false,
      };

      mockPrismaService.category.findUnique.mockResolvedValueOnce(
        existingCategory,
      );

      const result = await service.remove('uuid-123');

      expect(mockPrismaService.category.update).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, alreadyInactive: true });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
