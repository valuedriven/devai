import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../../database/__mocks__/prisma-service.mock';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { name: 'John Doe', email: 'john@example.com' };
      const expected = { id: 'uuid-123', ...dto, active: true };

      prisma.customer.create.mockResolvedValueOnce(expected);

      const result = await service.create(dto);

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('syncCustomer', () => {
    it('should return existing customer if found by email', async () => {
      const existing = {
        id: 'uuid-123',
        email: 'john@example.com',
        name: 'John Doe',
      };

      prisma.customer.findFirst.mockResolvedValueOnce(existing);

      const result = await service.syncCustomer('john@example.com', 'John Doe');

      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(prisma.customer.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it('should create a new customer if not found by email', async () => {
      prisma.customer.findFirst.mockResolvedValueOnce(null);

      const created = {
        id: 'uuid-456',
        email: 'jane@example.com',
        name: 'Jane Doe',
        active: true,
      };
      prisma.customer.create.mockResolvedValueOnce(created);

      const result = await service.syncCustomer('jane@example.com', 'Jane Doe');

      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: { email: 'jane@example.com', name: 'Jane Doe', active: true },
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all customers ordered by createdAt desc', async () => {
      const customers = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];

      prisma.customer.findMany.mockResolvedValueOnce(customers);

      const result = await service.findAll();

      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(customers);
    });
  });

  describe('findAllActive', () => {
    it('should return active customers ordered by name asc', async () => {
      const customers = [
        { id: '2', name: 'Jane', email: 'jane@example.com', active: true },
        { id: '1', name: 'John', email: 'john@example.com', active: true },
      ];

      prisma.customer.findMany.mockResolvedValueOnce(customers);

      const result = await service.findAllActive();

      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(customers);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const customer = {
        id: 'uuid-123',
        name: 'John',
        email: 'john@example.com',
      };

      prisma.customer.findUnique.mockResolvedValueOnce(customer);

      const result = await service.findOne('uuid-123');

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Customer with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const existing = {
        id: 'uuid-123',
        name: 'John',
        email: 'john@example.com',
      };
      const updateDto = { name: 'John Updated' };
      const updated = { ...existing, name: 'John Updated' };

      prisma.customer.findUnique.mockResolvedValueOnce(existing);
      prisma.customer.update.mockResolvedValueOnce(updated);

      const result = await service.update('uuid-123', updateDto);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: updateDto,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when customer to update not found', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      const customer = {
        id: 'uuid-123',
        name: 'John',
        email: 'john@example.com',
      };

      prisma.customer.findUnique.mockResolvedValueOnce(customer);
      prisma.customer.delete.mockResolvedValueOnce(customer);

      const result = await service.remove('uuid-123');

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(prisma.customer.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException when customer to remove not found', async () => {
      prisma.customer.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
