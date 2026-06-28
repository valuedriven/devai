import { Test, TestingModule } from '@nestjs/testing';
import { PublicCategoriesController } from './public-categories.controller';
import { CategoriesService } from '../services/categories.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

describe('PublicCategoriesController (Integration)', () => {
  let app: INestApplication;

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

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('GET /api/v1/categories', () => {
    it('should return list of active categories with pagination headers', async () => {
      mockCategoriesService.findAll.mockResolvedValue({
        data: [mockCategory],
        meta: { total: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body).toEqual([mockCategory]);
      expect(response.headers['x-total-count']).toBe('1');
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        includeInactive: false,
      });
    });

    it('should pass query filters to service', async () => {
      mockCategoriesService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      await request(app.getHttpServer())
        .get('/api/v1/categories?search=cat')
        .expect(200);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'cat',
        includeInactive: false,
      });
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return an active category', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const response = await request(app.getHttpServer())
        .get('/api/v1/categories/cat-1')
        .expect(200);

      expect(response.body).toEqual(mockCategory);
    });

    it('should return 404 Not Found if category is inactive', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockInactiveCategory);

      await request(app.getHttpServer())
        .get('/api/v1/categories/cat-2')
        .expect(404);
    });
  });
});
