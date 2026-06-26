import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from '../services/category.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

describe('CategoryController (Integration)', () => {
  let app: INestApplication;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
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
    jest.clearAllMocks();
    await app.close();
  });

  it('should reject creation if name is empty', async () => {
    return request(app.getHttpServer())
      .post('/categories')
      .send({
        name: '',
      })
      .expect(400);
  });

  it('should allow creation if inputs are valid', async () => {
    mockCategoryService.create.mockResolvedValue({
      id: 1,
      name: 'Valid Category',
    });
    return request(app.getHttpServer())
      .post('/categories')
      .send({
        name: 'Electronics',
      })
      .expect(201);
  });

  it('should find all categories', async () => {
    mockCategoryService.findAll.mockResolvedValue([{ id: 1, name: 'Cat' }]);
    return request(app.getHttpServer()).get('/categories').expect(200);
  });

  it('should find one category by id', async () => {
    mockCategoryService.findOne.mockResolvedValue({ id: 1, name: 'Cat' });
    return request(app.getHttpServer()).get('/categories/1').expect(200);
  });

  it('should update a category', async () => {
    mockCategoryService.update.mockResolvedValue({
      id: 1,
      name: 'Cat Updated',
    });
    return request(app.getHttpServer())
      .patch('/categories/1')
      .send({ name: 'Cat Updated' })
      .expect(200);
  });

  it('should remove a category', async () => {
    mockCategoryService.remove.mockResolvedValue(true);
    return request(app.getHttpServer()).delete('/categories/1').expect(200);
  });
});
