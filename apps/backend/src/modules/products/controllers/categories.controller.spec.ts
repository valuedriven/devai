/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';
import { ValidationPipe } from '@nestjs/common';
import { AdminCreateCategoryDto } from '../dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from '../dto/admin-update-category.dto';
import { AdminListCategoriesQueryDto } from '../dto/admin-list-categories-query.dto';
import { Response } from 'express';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category with valid data', async () => {
      // Arrange
      const dto: AdminCreateCategoryDto = { name: 'Electronics' };
      const expectedResult = { id: 'uuid-1', name: 'Electronics' };
      mockCategoriesService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
    });

    it('should reject creation when name is empty via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: AdminCreateCategoryDto,
        data: '',
      };

      await expect(target.transform({ name: '' }, metadata)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return categories with pagination headers', async () => {
      // Arrange
      const categories = [{ id: '1', name: 'Electronics' }];
      mockCategoriesService.findAll.mockResolvedValue({
        data: categories,
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const query: AdminListCategoriesQueryDto = {};

      // Act
      await controller.findAll(query, mockResponse);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Total-Count', 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(categories);
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(query);
    });

    it('should pass query parameters to service', async () => {
      // Arrange
      mockCategoriesService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 2, limit: 10, totalPages: 0 },
      });

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const query: AdminListCategoriesQueryDto = {
        page: 2,
        limit: 10,
        search: 'electronics',
      };

      // Act
      await controller.findAll(query, mockResponse);

      // Assert
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      // Arrange
      const expectedResult = { id: 'uuid-1', name: 'Electronics' };
      mockCategoriesService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne('uuid-1');

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      // Arrange
      const dto: AdminUpdateCategoryDto = { name: 'Updated' };
      const expectedResult = { id: 'uuid-1', name: 'Updated' };
      mockCategoriesService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.update('uuid-1', dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCategoriesService.update).toHaveBeenCalledWith('uuid-1', dto);
    });
  });

  describe('remove', () => {
    it('should soft delete a category', async () => {
      // Arrange
      mockCategoriesService.remove.mockResolvedValue({
        success: true,
        alreadyInactive: false,
      });

      // Act
      await controller.remove('uuid-1');

      // Assert
      expect(mockCategoriesService.remove).toHaveBeenCalledWith('uuid-1');
    });
  });
});
