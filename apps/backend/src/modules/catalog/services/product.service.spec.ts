import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../../database/prisma.service';

describe('ProductService', () => {
  let service: ProductService;

  const mockPrismaService = {
    product: {
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

  describe('findAll', () => {
    it('should query prisma findMany without public filtering if publicView is false', async () => {
      mockPrismaService.product.findMany.mockResolvedValueOnce([]);
      const tenantId = 'test-tenant';
      await service.findAll(tenantId, undefined, false);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
        },
        include: { category: true },
      });
    });

    it('should query prisma findMany with active filters if publicView is true', async () => {
      mockPrismaService.product.findMany.mockResolvedValueOnce([]);
      const tenantId = 'test-tenant';
      await service.findAll(tenantId, undefined, true);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          active: true,
          category: { active: true },
        },
        include: { category: true },
      });
    });

    it('should include search filter if search parameter is provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValueOnce([]);
      const tenantId = 'test-tenant';
      await service.findAll(tenantId, 'phone', true);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          name: { contains: 'phone', mode: 'insensitive' },
          active: true,
          category: { active: true },
        },
        include: { category: true },
      });
    });
  });

  describe('create', () => {
    it('should call prisma.product.create', async () => {
      const dto = {
        name: 'Phone',
        description: 'Nice phone',
        price: 999,
        categoryId: 1,
        stock: 10,
        active: true,
      };
      const tenantId = 'tenant-1';
      mockPrismaService.product.create.mockResolvedValueOnce({
        id: 1n,
        ...dto,
        categoryId: 1n,
        tenantId,
      });

      await service.create(dto, tenantId);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Phone',
          description: 'Nice phone',
          price: 999,
          stock: 10,
          active: true,
          categoryId: 1n,
          tenantId,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should call prisma.product.findFirst', async () => {
      const tenantId = 'tenant-1';
      mockPrismaService.product.findFirst.mockResolvedValueOnce(null);
      await service.findOne(1, tenantId);
      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith({
        where: { id: 1n, tenantId },
        include: { category: true },
      });
    });
  });

  describe('update', () => {
    it('should call prisma.product.update', async () => {
      const dto = { name: 'New Name', categoryId: 2 };
      mockPrismaService.product.update.mockResolvedValueOnce({ id: 1n });
      await service.update(1, dto, 'tenant-1');
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: {
          name: 'New Name',
          categoryId: 2n,
        },
      });
    });
  });

  describe('remove', () => {
    it('should return false if product not found', async () => {
      mockPrismaService.product.findFirst.mockResolvedValueOnce(null);
      const result = await service.remove(1, 'tenant-1');
      expect(result).toBe(false);
    });

    it('should delete and return true if product found', async () => {
      mockPrismaService.product.findFirst.mockResolvedValueOnce({ id: 1n });
      mockPrismaService.product.delete.mockResolvedValueOnce({ id: 1n });
      const result = await service.remove(1, 'tenant-1');
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1n },
      });
      expect(result).toBe(true);
    });
  });
});
