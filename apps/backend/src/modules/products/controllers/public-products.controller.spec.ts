import { Test, TestingModule } from '@nestjs/testing';
import { PublicProductsController } from './public-products.controller';
import { ProductsService } from '../services/products.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

describe('PublicProductsController (Integration)', () => {
  let app: INestApplication;

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

  describe('GET /api/v1/products', () => {
    it('should return list of active products with pagination headers', async () => {
      mockProductsService.findAll.mockResolvedValue({
        data: [mockProduct],
        meta: { total: 1 },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(response.body).toEqual([mockProduct]);
      expect(response.headers['x-total-count']).toBe('1');
      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        categoryId: undefined,
        includeInactive: false,
      });
    });

    it('should pass query filters to service', async () => {
      mockProductsService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      await request(app.getHttpServer())
        .get('/api/v1/products?search=active&categoryId=cat-1')
        .expect(200);

      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'active',
        categoryId: 'cat-1',
        includeInactive: false,
      });
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return an active product', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get('/api/v1/products/prod-1')
        .expect(200);

      expect(response.body).toEqual(mockProduct);
    });

    it('should return 404 Not Found if product is inactive', async () => {
      mockProductsService.findOne.mockResolvedValue(mockInactiveProduct);

      await request(app.getHttpServer())
        .get('/api/v1/products/prod-2')
        .expect(404);
    });
  });
});
