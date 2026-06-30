import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import type { App } from 'supertest/types';

const adminUser = {
  id: 'admin-id',
  clerkId: 'admin-id',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  publicMetadata: { roles: ['admin'] },
  emailAddresses: [{ emailAddress: 'admin@example.com' }],
};

const customerUser = {
  id: 'cust-id',
  clerkId: 'cust-id',
  email: 'john@example.com',
  role: 'CUSTOMER' as const,
  publicMetadata: { roles: ['customer'] },
  emailAddresses: [{ emailAddress: 'john@example.com' }],
};

describe('OrdersController (Integration)', () => {
  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    cancel: jest.fn(),
  };

  const buildApp = async (user: Record<string, unknown>) => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app = module.createNestApplication<INestApplication<App>>();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const typedUser = user as {
        role?: string;
        email?: string;
        publicMetadata?: {
          roles?: string[] | string;
          role?: string[] | string;
        };
        emailAddresses?: Array<{ emailAddress?: string }>;
      };
      (req as Request & { user: Record<string, unknown> }).user = {
        ...user,
        role:
          typedUser.role ||
          (typedUser.publicMetadata?.roles?.includes('admin') ||
          typedUser.publicMetadata?.role === 'admin'
            ? 'ADMIN'
            : 'CUSTOMER'),
        email: typedUser.email || typedUser.emailAddresses?.[0]?.emailAddress,
      };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    return app;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('as admin', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
      app = await buildApp(adminUser);
    });

    afterEach(async () => {
      await app.close();
    });

    describe('POST /orders', () => {
      it('should create an order using customerId from body', async () => {
        // Arrange
        const dto = {
          customerId: 'cust-1',
          totalAmount: 150.0,
          order_items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50.0 }],
        };

        mockOrdersService.create.mockResolvedValue({ id: 'order-1', ...dto });

        await request(app.getHttpServer())
          .post('/orders')
          .send(dto)
          .expect(201);

        // Assert
        expect(mockOrdersService.create).toHaveBeenCalledWith(
          expect.any(Object),
          undefined,
        );
      });
    });

    describe('GET /orders', () => {
      it('should return all orders', async () => {
        // Arrange
        mockOrdersService.findAll.mockResolvedValue({
          data: [{ id: 'order-1' }],
          total: 1,
        });

        await request(app.getHttpServer()).get('/orders').expect(200);

        // Assert
        expect(mockOrdersService.findAll).toHaveBeenCalledWith(undefined, {
          skip: 0,
          take: 20,
          status: undefined,
        });
      });

      it('should filter orders by status', async () => {
        // Arrange
        mockOrdersService.findAll.mockResolvedValue({
          data: [{ id: 'order-1' }],
          total: 1,
        });

        await request(app.getHttpServer())
          .get('/orders?status=Novo')
          .expect(200);

        // Assert
        expect(mockOrdersService.findAll).toHaveBeenCalledWith(undefined, {
          skip: 0,
          take: 20,
          status: 'Novo',
        });
      });
    });

    describe('PATCH /orders/:id/status', () => {
      it('should update order status', async () => {
        mockOrdersService.updateStatus.mockResolvedValue({
          id: 'order-1',
          status: 'Enviado',
        });

        return request(app.getHttpServer())
          .patch('/orders/order-1/status')
          .send({ status: 'Enviado' })
          .expect(200);
      });
    });

    describe('PATCH /orders/:id', () => {
      it('should update an order', async () => {
        mockOrdersService.update.mockResolvedValue({
          id: 'order-1',
          shippingAddress: 'New Address',
        });

        return request(app.getHttpServer())
          .patch('/orders/order-1')
          .send({ shippingAddress: 'New Address' })
          .expect(200);
      });
    });

    describe('DELETE /orders/:id', () => {
      it('should delete an order as admin', async () => {
        mockOrdersService.remove.mockResolvedValue({ id: 'order-1' });

        return request(app.getHttpServer())
          .delete('/orders/order-1')
          .expect(200);
      });
    });

    describe('role parsing variants', () => {
      it('should accept admin role as a single string in metadata.roles', async () => {
        // Arrange
        const roleStringApp = await buildApp({
          publicMetadata: { roles: 'admin' },
          emailAddresses: [{ emailAddress: 'admin@example.com' }],
        });

        mockOrdersService.findAll.mockResolvedValue({
          data: [{ id: 'order-1' }],
          total: 1,
        });

        await request(roleStringApp.getHttpServer()).get('/orders').expect(200);

        // Act
        await roleStringApp.close();
      });

      it('should accept admin role in metadata.role array', async () => {
        // Arrange
        const roleArrayApp = await buildApp({
          publicMetadata: { role: ['admin'] },
          emailAddresses: [{ emailAddress: 'admin@example.com' }],
        });

        mockOrdersService.findAll.mockResolvedValue({
          data: [{ id: 'order-1' }],
          total: 1,
        });

        await request(roleArrayApp.getHttpServer()).get('/orders').expect(200);

        // Act
        await roleArrayApp.close();
      });

      it('should accept admin role as a single string in metadata.role', async () => {
        // Arrange
        const roleStringApp = await buildApp({
          publicMetadata: { role: 'admin' },
          emailAddresses: [{ emailAddress: 'admin@example.com' }],
        });

        mockOrdersService.findAll.mockResolvedValue({
          data: [{ id: 'order-1' }],
          total: 1,
        });

        await request(roleStringApp.getHttpServer()).get('/orders').expect(200);

        // Act
        await roleStringApp.close();
      });
    });
  });

  describe('as customer', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
      app = await buildApp(customerUser);
    });

    afterEach(async () => {
      await app.close();
    });

    describe('POST /orders', () => {
      it('should force create using authenticated user email', async () => {
        // Arrange
        const dto = {
          totalAmount: 150.0,
          order_items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50.0 }],
        };

        mockOrdersService.create.mockResolvedValue({ id: 'order-1', ...dto });

        await request(app.getHttpServer())
          .post('/orders')
          .send(dto)
          .expect(201);

        // Assert
        expect(mockOrdersService.create).toHaveBeenCalledWith(
          expect.any(Object),
          'john@example.com',
        );
      });
    });

    describe('GET /orders/:id', () => {
      it('should return 404 when order belongs to another customer', async () => {
        mockOrdersService.findOne.mockResolvedValue({
          id: 'order-1',
          customer: { email: 'other@example.com' },
        });

        return request(app.getHttpServer()).get('/orders/order-1').expect(404);
      });

      it('should return the order when it belongs to the customer', async () => {
        mockOrdersService.findOne.mockResolvedValue({
          id: 'order-1',
          customer: { email: 'john@example.com' },
        });

        return request(app.getHttpServer()).get('/orders/order-1').expect(200);
      });
    });

    describe('POST /orders/:id/cancel', () => {
      it('should cancel the order', async () => {
        // Arrange
        mockOrdersService.cancel.mockResolvedValue({
          id: 'order-1',
          status: 'Cancelado',
        });

        await request(app.getHttpServer())
          .post('/orders/order-1/cancel')
          .expect(201);

        // Assert
        expect(mockOrdersService.cancel).toHaveBeenCalledWith(
          'order-1',
          'john@example.com',
        );
      });
    });

    describe('PATCH /orders/:id', () => {
      it('should return 404 for customer update attempts', async () => {
        return request(app.getHttpServer())
          .patch('/orders/order-1')
          .send({ shippingAddress: 'New Address' })
          .expect(404);
      });
    });
  });
});
