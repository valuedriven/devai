/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { BadRequestException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 'prod-1',
    name: 'Test Product',
    description: 'Test Desc',
    price: 10,
    stock: 5,
    active: true,
    categoryId: 'cat-1',
  };

  const mockProductsService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findAll: jest.fn().mockResolvedValue({
      data: [mockProduct],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    }),
    findOne: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue({ ...mockProduct, price: 20 }),
    remove: jest
      .fn()
      .mockResolvedValue({ success: true, alreadyInactive: false }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = { name: 'Test Product', price: 10, stock: 5 };
    const result = await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockProduct);
  });

  it('should find all products', async () => {
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => data),
    } as any;

    const result = await controller.findAll({ page: 1, limit: 10 }, res);
    expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.setHeader).toHaveBeenCalledWith('X-Total-Count', 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(result).toEqual([mockProduct]);
  });

  it('should find one product', async () => {
    const result = await controller.findOne('prod-1');
    expect(service.findOne).toHaveBeenCalledWith('prod-1');
    expect(result).toEqual(mockProduct);
  });

  it('should update a product', async () => {
    const dto = { price: 20 };
    const result = await controller.update('prod-1', dto as any);
    expect(service.update).toHaveBeenCalledWith('prod-1', dto);
    expect(result.price).toEqual(20);
  });

  it('should remove a product', async () => {
    const result = await controller.remove('prod-1');
    expect(service.remove).toHaveBeenCalledWith('prod-1');
    expect(result).toBeUndefined();
  });

  it('should upload a file and return url', async () => {
    const mockFile = { filename: 'test-123.jpg' } as Express.Multer.File;
    const result = await controller.uploadFile(mockFile);
    expect(result).toEqual({ imageUrl: '/uploads/test-123.jpg' });
  });

  it('should throw BadRequestException if no file is uploaded', async () => {
    await expect(controller.uploadFile(undefined as any)).rejects.toThrow(
      BadRequestException,
    );
  });
});
