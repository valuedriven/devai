/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PublicProductsController } from './public-products.controller';
import { ProductsService } from '../services/products.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PublicListProductsQueryDto } from '../dto/public-list-products-query.dto';

describe('PublicProductsController', () => {
  let controller: PublicProductsController;

  const mockProduct = {
    id: 'prod-1',
    name: 'Active Product',
    description: 'Active Desc',
    price: 10,
    stock: 5,
    active: true,
    categoryId: 'cat-1',
  };

  const mockInactiveProduct = {
    id: 'prod-2',
    name: 'Inactive Product',
    description: 'Inactive Desc',
    price: 15,
    stock: 0,
    active: false,
    categoryId: 'cat-1',
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<PublicProductsController>(PublicProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return list of active products with pagination headers', async () => {
      // Arrange
      mockProductsService.findAll.mockResolvedValue({
        data: [mockProduct],
        meta: { total: 1 },
      });

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const query: PublicListProductsQueryDto = {
        page: 1,
        limit: 20,
      };

      // Act
      await controller.findAll(query, mockResponse);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Total-Count', 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([mockProduct]);
      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        includeInactive: false,
      });
    });

    it('should pass query filters to service', async () => {
      // Arrange
      mockProductsService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const query: PublicListProductsQueryDto = {
        page: 1,
        limit: 20,
        search: 'active',
        categoryId: 'cat-1',
      };

      // Act
      await controller.findAll(query, mockResponse);

      // Assert
      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'active',
        categoryId: 'cat-1',
        includeInactive: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return an active product', async () => {
      // Arrange
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      // Act
      const result = await controller.findOne('prod-1');

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('prod-1');
    });

    it('should throw NotFoundException if product is inactive', async () => {
      // Arrange
      mockProductsService.findOne.mockResolvedValue(mockInactiveProduct);

      // Act & Assert
      await expect(controller.findOne('prod-2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
