import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../../database/prisma.service';

describe('ProductService', () => {
  let service: ProductService;

  const mockPrismaService = {
    product: {
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
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'Test Product',
        description: 'Description',
        price: 100,
        categoryId: 'uuid-123',
        stock: 10,
        active: true,
      };
      mockPrismaService.product.create.mockResolvedValueOnce({
        id: 'prod-uuid-123',
        ...dto,
      });

      const result = await service.create(dto);
      expect(mockPrismaService.product.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should call prisma.product.findMany', async () => {
      mockPrismaService.product.findMany.mockResolvedValueOnce([]);
      await service.findAll();
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call prisma.product.findUnique', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);
      await service.findOne('prod-uuid-123');
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-123' },
        include: { category: true },
      });
    });
  });

  describe('update', () => {
    it('should call prisma.product.update', async () => {
      const dto = { name: 'Updated Product' };
      mockPrismaService.product.update.mockResolvedValueOnce({
        id: 'prod-uuid-123',
        name: 'Updated Product',
      });
      await service.update('prod-uuid-123', dto);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-123' },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should return false if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);
      const result = await service.remove('prod-uuid-123');
      expect(result).toBe(false);
    });

    it('should delete and return true if product found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce({
        id: 'prod-uuid-123',
      });
      mockPrismaService.product.delete.mockResolvedValueOnce({
        id: 'prod-uuid-123',
      });
      const result = await service.remove('prod-uuid-123');
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-123' },
      });
      expect(result).toBe(true);
    });
  });
});
