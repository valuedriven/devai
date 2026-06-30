import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { AdminCreateProductDto } from '../dto/admin-create-product.dto';
import { AdminUpdateProductDto } from '../dto/admin-update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;

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
  });

  it('should create a product', async () => {
    // Arrange
    const dto = { name: 'Test Product', price: 10, stock: 5 };
    // Act
    const result = await controller.create(dto as AdminCreateProductDto);
    // Assert
    expect(mockProductsService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockProduct);
  });

  it('should find all products', async () => {
    // Arrange
    const setHeader = jest.fn();
    const status = jest.fn().mockReturnThis();
    const json = jest.fn().mockImplementation((data: unknown) => data);
    const res = { setHeader, status, json } as unknown as Response;

    // Act
    const result = await controller.findAll({ page: 1, limit: 10 }, res);
    // Assert
    expect(mockProductsService.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(setHeader).toHaveBeenCalledWith('X-Total-Count', 1);
    expect(status).toHaveBeenCalledWith(200);
    expect(result).toEqual([mockProduct]);
  });

  it('should find one product', async () => {
    // Act
    const result = await controller.findOne('prod-1');
    // Assert
    expect(mockProductsService.findOne).toHaveBeenCalledWith('prod-1');
    expect(result).toEqual(mockProduct);
  });

  it('should update a product', async () => {
    // Arrange
    const dto = { price: 20 };
    // Act
    const result = await controller.update(
      'prod-1',
      dto as AdminUpdateProductDto,
    );
    // Assert
    expect(mockProductsService.update).toHaveBeenCalledWith('prod-1', dto);
    expect(result.price).toEqual(20);
  });

  it('should remove a product', async () => {
    // Act
    const result = await controller.remove('prod-1');
    // Assert
    expect(mockProductsService.remove).toHaveBeenCalledWith('prod-1');
    expect(result).toBeUndefined();
  });

  it('should upload a file and return url', () => {
    // Arrange
    const mockFile = { filename: 'test-123.jpg' } as Express.Multer.File;
    // Act
    const result = controller.uploadFile(mockFile);
    // Assert
    expect(result).toEqual({ imageUrl: '/uploads/test-123.jpg' });
  });

  it('should throw BadRequestException if no file is uploaded', () => {
    // Act & Assert
    expect(() =>
      controller.uploadFile(undefined as unknown as Express.Multer.File),
    ).toThrow(BadRequestException);
  });
});
