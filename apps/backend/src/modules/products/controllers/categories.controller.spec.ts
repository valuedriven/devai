import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

describe('CategoriesController (Integration)', () => {
  let app: INestApplication;

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
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('POST /admin/categories', () => {
    it('should create a category with valid data', async () => {
      mockCategoriesService.create.mockResolvedValue({
        id: 'uuid-1',
        name: 'Electronics',
      });

      return request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Electronics' })
        .expect(201);
    });

    it('should reject creation when name is empty', async () => {
      return request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /admin/categories', () => {
    it('should return categories with pagination headers', async () => {
      const categories = [{ id: '1', name: 'Electronics' }];
      mockCategoriesService.findAll.mockResolvedValue({
        data: categories,
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/admin/categories')
        .expect(200);

      expect(response.body).toEqual(categories);
      expect(response.headers['x-total-count']).toBe('1');
    });

    it('should pass query parameters to service', async () => {
      mockCategoriesService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get('/admin/categories?page=2&limit=10&search=electronics')
        .expect(200);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          search: 'electronics',
        }),
      );
    });
  });

  describe('GET /admin/categories/:id', () => {
    it('should return a category by id', async () => {
      mockCategoriesService.findOne.mockResolvedValue({
        id: 'uuid-1',
        name: 'Electronics',
      });

      return request(app.getHttpServer())
        .get('/admin/categories/uuid-1')
        .expect(200);
    });
  });

  describe('PATCH /admin/categories/:id', () => {
    it('should update a category', async () => {
      mockCategoriesService.update.mockResolvedValue({
        id: 'uuid-1',
        name: 'Updated',
      });

      return request(app.getHttpServer())
        .patch('/admin/categories/uuid-1')
        .send({ name: 'Updated' })
        .expect(200);
    });
  });

  describe('DELETE /admin/categories/:id', () => {
    it('should soft delete a category returning 204', async () => {
      mockCategoriesService.remove.mockResolvedValue({
        success: true,
        alreadyInactive: false,
      });

      return request(app.getHttpServer())
        .delete('/admin/categories/uuid-1')
        .expect(204);
    });
  });
});
