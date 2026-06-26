import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../../database/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call prisma.category.create', async () => {
      const dto = { name: 'Electronics', active: true };
      mockPrismaService.category.create.mockResolvedValueOnce({
        id: 'uuid-123',
        name: 'Electronics',
        nameNormalized: 'electronics',
        slug: 'electronics',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(dto);
      expect(mockPrismaService.category.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should call prisma.category.findMany', async () => {
      mockPrismaService.category.findMany.mockResolvedValueOnce([]);
      await service.findAll();
      expect(mockPrismaService.category.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call prisma.category.findUnique', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);
      await service.findOne('uuid-123');
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });
  });

  describe('update', () => {
    it('should call prisma.category.update', async () => {
      const dto = { name: 'Books' };
      mockPrismaService.category.update.mockResolvedValueOnce({
        id: 'uuid-123',
        name: 'Books',
        nameNormalized: 'books',
        slug: 'books',
        active: true,
      });
      await service.update('uuid-123', dto);
      expect(mockPrismaService.category.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should return false if category is not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);
      const result = await service.remove('uuid-123');
      expect(result).toBe(false);
    });

    it('should soft delete and return true if category is found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce({
        id: 'uuid-123',
        active: true,
      });
      mockPrismaService.category.update.mockResolvedValueOnce({
        id: 'uuid-123',
        active: false,
      });
      const result = await service.remove('uuid-123');
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { active: false },
      });
      expect(result).toBe(true);
    });
  });
});
