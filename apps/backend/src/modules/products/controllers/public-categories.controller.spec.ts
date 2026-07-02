/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PublicCategoriesController } from './public-categories.controller';
import { CategoriesService } from '../services/categories.service';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PublicListCategoriesQueryDto } from '../dto/public-list-categories-query.dto';

describe('PublicCategoriesController', () => {
  let controller: PublicCategoriesController;

  const mockCategory = {
    id: 'cat-1',
    name: 'Active Category',
    active: true,
  };

  const mockInactiveCategory = {
    id: 'cat-2',
    name: 'Inactive Category',
    active: false,
  };

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicCategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<PublicCategoriesController>(
      PublicCategoriesController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return list of active categories with pagination headers', async () => {
      // Arrange
      mockCategoriesService.findAll.mockResolvedValue({
        data: [mockCategory],
        meta: { total: 1 },
      });

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const query: PublicListCategoriesQueryDto = {
        page: 1,
        limit: 20,
      };

      // Act
      await controller.findAll(query, mockResponse);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Total-Count', 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([mockCategory]);
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        includeInactive: false,
      });
    });

    it('should pass query filters to service', async () => {
      // Arrange
      mockCategoriesService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const query: PublicListCategoriesQueryDto = {
        page: 1,
        limit: 20,
        search: 'cat',
      };

      // Act
      await controller.findAll(query, mockResponse);

      // Assert
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'cat',
        includeInactive: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return an active category', async () => {
      // Arrange
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      // Act
      const result = await controller.findOne('cat-1');

      // Assert
      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('cat-1');
    });

    it('should throw NotFoundException if category is inactive', async () => {
      // Arrange
      mockCategoriesService.findOne.mockResolvedValue(mockInactiveCategory);

      // Act & Assert
      await expect(controller.findOne('cat-2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
