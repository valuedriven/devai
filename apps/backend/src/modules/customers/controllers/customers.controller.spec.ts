import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from '../services/customers.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

describe('CustomersController (Integration)', () => {
  let app: INestApplication<App>;

  const mockCustomersService = {
    create: jest.fn(),
    syncCustomer: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication<INestApplication<App>>();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('POST /customers', () => {
    it('should create a customer with valid data', async () => {
      const dto = { name: 'John Doe', email: 'john@example.com' };
      mockCustomersService.create.mockResolvedValue({ id: 'uuid-1', ...dto });

      return request(app.getHttpServer())
        .post('/customers')
        .send(dto)
        .expect(201);
    });

    it('should reject creation when name is empty', async () => {
      return request(app.getHttpServer())
        .post('/customers')
        .send({ name: '', email: 'john@example.com' })
        .expect(400);
    });

    it('should reject creation when email is invalid', async () => {
      return request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'John', email: 'not-an-email' })
        .expect(400);
    });

    it('should reject creation when email is missing', async () => {
      return request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'John' })
        .expect(400);
    });
  });

  describe('POST /customers/sync', () => {
    it('should sync a customer', async () => {
      mockCustomersService.syncCustomer.mockResolvedValue({
        id: 'uuid-1',
        email: 'john@example.com',
        name: 'John Doe',
      });

      return request(app.getHttpServer())
        .post('/customers/sync')
        .send({ email: 'john@example.com', name: 'John Doe' })
        .expect(201);
    });

    it('should reject sync when email is missing', async () => {
      return request(app.getHttpServer())
        .post('/customers/sync')
        .send({ name: 'John' })
        .expect(400);
    });

    it('should reject sync when name is missing', async () => {
      return request(app.getHttpServer())
        .post('/customers/sync')
        .send({ email: 'john@example.com' })
        .expect(400);
    });
  });

  describe('GET /customers', () => {
    it('should return all customers', async () => {
      mockCustomersService.findAll.mockResolvedValue([
        { id: '1', name: 'John' },
      ]);

      return request(app.getHttpServer()).get('/customers').expect(200);
    });

    it('should support search query parameter', async () => {
      // Arrange
      mockCustomersService.findAll.mockResolvedValue([
        { id: '1', name: 'John' },
      ]);

      await request(app.getHttpServer())
        .get('/customers?search=John')
        .expect(200);

      // Assert
      expect(mockCustomersService.findAll).toHaveBeenCalledWith('John');
    });
  });

  describe('GET /customers/active', () => {
    it('should return active customers', async () => {
      mockCustomersService.findAllActive.mockResolvedValue([
        { id: '1', name: 'John', active: true },
      ]);

      return request(app.getHttpServer()).get('/customers/active').expect(200);
    });
  });

  describe('GET /customers/:id', () => {
    it('should return a customer by id', async () => {
      mockCustomersService.findOne.mockResolvedValue({
        id: 'uuid-1',
        name: 'John',
      });

      return request(app.getHttpServer()).get('/customers/uuid-1').expect(200);
    });

    it('should return 404 when customer not found', async () => {
      mockCustomersService.findOne.mockRejectedValue(
        new NotFoundException('Customer with ID non-existent not found'),
      );

      return request(app.getHttpServer())
        .get('/customers/non-existent')
        .expect(404);
    });
  });

  describe('PATCH /customers/:id', () => {
    it('should update a customer', async () => {
      mockCustomersService.update.mockResolvedValue({
        id: 'uuid-1',
        name: 'Updated',
      });

      return request(app.getHttpServer())
        .patch('/customers/uuid-1')
        .send({ name: 'Updated' })
        .expect(200);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer', async () => {
      mockCustomersService.remove.mockResolvedValue({
        id: 'uuid-1',
        name: 'John',
      });

      return request(app.getHttpServer())
        .delete('/customers/uuid-1')
        .expect(200);
    });

    it('should return 409 conflict when customer has associated orders', async () => {
      mockCustomersService.remove.mockRejectedValue(
        new ConflictException('Cannot delete customer with associated orders'),
      );

      return request(app.getHttpServer())
        .delete('/customers/uuid-1')
        .expect(409);
    });
  });
});
