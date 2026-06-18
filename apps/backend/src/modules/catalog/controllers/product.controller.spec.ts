import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../services/product.service';
import { ClerkService } from '../../../core/auth/clerk.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

describe('ProductController (Integration)', () => {
  let app: INestApplication;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockClerkService = {
    verifyToken: jest.fn(),
    getUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: ClerkService,
          useValue: mockClerkService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should reject creation if price is 0 or negative', async () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Invalid Price Product',
        description: 'Test description',
        price: 0,
        categoryId: 1,
        stock: 10,
      })
      .expect(400);
  });

  it('should reject creation if stock is negative', async () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Invalid Stock Product',
        description: 'Test description',
        price: 100,
        categoryId: 1,
        stock: -5,
      })
      .expect(400);
  });

  it('should allow creation if inputs are valid', async () => {
    mockProductService.create.mockResolvedValue({ id: 1 });
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Valid Product',
        description: 'Test description',
        price: 99.99,
        categoryId: 1,
        stock: 5,
      })
      .expect(201);
  });

  it('should get products as public (publicView = true)', async () => {
    mockProductService.findAll.mockResolvedValue([]);
    await request(app.getHttpServer()).get('/products').expect(200);

    expect(mockProductService.findAll).toHaveBeenCalledWith(
      undefined,
      undefined,
      true,
    );
  });

  it('should get products as admin (publicView = false)', async () => {
    mockProductService.findAll.mockResolvedValue([]);
    mockClerkService.verifyToken.mockResolvedValue({ sub: 'user-1' });
    mockClerkService.getUser.mockResolvedValue({
      id: 'user-1',
      publicMetadata: { roles: ['admin'] },
    });

    await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(mockProductService.findAll).toHaveBeenCalledWith(
      undefined,
      undefined,
      false,
    );
  });

  it('should get active products', async () => {
    mockProductService.findAllActive.mockResolvedValue([]);
    return request(app.getHttpServer()).get('/products/active').expect(200);
  });

  it('should find one product by id', async () => {
    mockProductService.findOne.mockResolvedValue({ id: 1 });
    return request(app.getHttpServer()).get('/products/1').expect(200);
  });

  it('should update a product', async () => {
    mockProductService.update.mockResolvedValue({ id: 1 });
    return request(app.getHttpServer())
      .patch('/products/1')
      .send({ name: 'New Name' })
      .expect(200);
  });

  it('should remove a product', async () => {
    mockProductService.remove.mockResolvedValue(true);
    return request(app.getHttpServer()).delete('/products/1').expect(200);
  });
});
