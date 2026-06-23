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
      mockPrismaService.category.create.mockResolvedValueOnce({
        id: 1n,
        ...dto,
      });

      const result = await service.create(dto);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should call prisma.category.findMany', async () => {
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      await service.findAll();
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call prisma.category.findFirst', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);
      await service.findOne(1);
      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: { id: 1n },
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
      await service.update(1, dto);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should return false if category is not found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);
      const result = await service.remove(1);
      expect(result).toBe(false);
    });

    it('should delete and return true if category is found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce({ id: 1n });
      mockPrismaService.category.delete.mockResolvedValueOnce({ id: 1n });
      const result = await service.remove(1);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1n },
      });
      expect(result).toBe(true);
    });
  });
});
