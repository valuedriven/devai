import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from '../services/customers.service';
import {
  NotFoundException,
  ConflictException,
  ValidationPipe,
} from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { SyncCustomerDto } from '../dto/sync-customer.dto';

describe('CustomersController', () => {
  let controller: CustomersController;

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
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer with valid data', async () => {
      // Arrange
      const dto: CreateCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const expectedResult = { id: 'uuid-1', ...dto };
      mockCustomersService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.create).toHaveBeenCalledWith(dto);
    });

    it('should reject creation when name is empty via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: CreateCustomerDto,
        data: '',
      };

      await expect(
        target.transform({ name: '', email: 'john@example.com' }, metadata),
      ).rejects.toThrow();
    });

    it('should reject creation when email is invalid via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: CreateCustomerDto,
        data: '',
      };

      await expect(
        target.transform({ name: 'John', email: 'not-an-email' }, metadata),
      ).rejects.toThrow();
    });

    it('should reject creation when email is missing via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: CreateCustomerDto,
        data: '',
      };

      await expect(
        target.transform({ name: 'John' }, metadata),
      ).rejects.toThrow();
    });
  });

  describe('syncCustomer', () => {
    it('should sync a customer', async () => {
      // Arrange
      const dto: SyncCustomerDto = {
        email: 'john@example.com',
        name: 'John Doe',
      };
      const expectedResult = {
        id: 'uuid-1',
        email: 'john@example.com',
        name: 'John Doe',
      };
      mockCustomersService.syncCustomer.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.syncCustomer(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.syncCustomer).toHaveBeenCalledWith(
        dto.email,
        dto.name,
      );
    });

    it('should reject sync when email is missing via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: SyncCustomerDto,
        data: '',
      };

      await expect(
        target.transform({ name: 'John' }, metadata),
      ).rejects.toThrow();
    });

    it('should reject sync when name is missing via ValidationPipe', async () => {
      const target = new ValidationPipe({ transform: true, whitelist: true });
      const metadata = {
        type: 'body' as const,
        metatype: SyncCustomerDto,
        data: '',
      };

      await expect(
        target.transform({ email: 'john@example.com' }, metadata),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      // Arrange
      const expectedResult = [{ id: '1', name: 'John' }];
      mockCustomersService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should support search query parameter', async () => {
      // Arrange
      const expectedResult = [{ id: '1', name: 'John' }];
      mockCustomersService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll('John');

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.findAll).toHaveBeenCalledWith('John');
    });
  });

  describe('findAllActive', () => {
    it('should return active customers', async () => {
      // Arrange
      const expectedResult = [{ id: '1', name: 'John', active: true }];
      mockCustomersService.findAllActive.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAllActive();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.findAllActive).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      // Arrange
      const expectedResult = { id: 'uuid-1', name: 'John' };
      mockCustomersService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne('uuid-1');

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when customer not found', async () => {
      // Arrange
      mockCustomersService.findOne.mockRejectedValue(
        new NotFoundException('Customer with ID non-existent not found'),
      );

      // Act & Assert
      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      // Arrange
      const dto: UpdateCustomerDto = { name: 'Updated' };
      const expectedResult = { id: 'uuid-1', name: 'Updated' };
      mockCustomersService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.update('uuid-1', dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.update).toHaveBeenCalledWith('uuid-1', dto);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      // Arrange
      const expectedResult = { id: 'uuid-1', name: 'John' };
      mockCustomersService.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove('uuid-1');

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCustomersService.remove).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw ConflictException when customer has associated orders', async () => {
      // Arrange
      mockCustomersService.remove.mockRejectedValue(
        new ConflictException('Cannot delete customer with associated orders'),
      );

      // Act & Assert
      await expect(controller.remove('uuid-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
