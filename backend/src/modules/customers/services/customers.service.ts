import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, tenantId: string) {
    return this.prisma.customers.create({
      data: {
        ...createCustomerDto,
        tenantId,
      },
    });
  }

  async syncCustomer(email: string, name: string, tenantId: string) {
    const existingCustomer = await this.prisma.customers.findFirst({
      where: { email, tenantId },
    });

    if (existingCustomer) {
      return existingCustomer;
    }

    return this.prisma.customers.create({
      data: {
        email,
        name,
        tenantId,
        active: true,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.customers.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllActive(tenantId: string) {
    return this.prisma.customers.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: bigint, tenantId: string) {
    const customer = await this.prisma.customers.findFirst({
      where: { id, tenantId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(
    id: bigint,
    updateCustomerDto: UpdateCustomerDto,
    tenantId: string,
  ) {
    await this.findOne(id, tenantId); // verify exists

    return this.prisma.customers.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: bigint, tenantId: string) {
    await this.findOne(id, tenantId); // verify exists

    return this.prisma.customers.delete({
      where: { id },
    });
  }
}
