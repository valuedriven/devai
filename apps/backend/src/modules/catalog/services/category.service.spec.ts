import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../../database/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call prisma.category.create', async () => {
      const dto = { name: 'Electronics', active: true };
      const tenantId = 'tenant-1';
      mockPrismaService.category.create.mockResolvedValueOnce({
        id: 1n,
        ...dto,
        tenantId,
      });

      const result = await service.create(dto, tenantId);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          tenantId,
        },
      });
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should call prisma.category.findMany', async () => {
      const tenantId = 'tenant-1';
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      await service.findAll(tenantId);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { tenantId },
      });
    });
  });

  describe('findOne', () => {
    it('should call prisma.category.findFirst', async () => {
      const tenantId = 'tenant-1';
      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);
      await service.findOne(1, tenantId);
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: 1n, tenantId },
      });
    });
  });

  describe('update', () => {
    it('should call prisma.category.update', async () => {
      const dto = { name: 'Books' };
      mockPrismaService.category.update.mockResolvedValueOnce({
        id: 1n,
        name: 'Books',
      });
      await service.update(1, dto, 'tenant-1');
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should return false if category is not found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);
      const result = await service.remove(1, 'tenant-1');
      expect(result).toBe(false);
    });

    it('should delete and return true if category is found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce({ id: 1n });
      mockPrismaService.category.delete.mockResolvedValueOnce({ id: 1n });
      const result = await service.remove(1, 'tenant-1');
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1n },
      });
      expect(result).toBe(true);
    });
  });
});
