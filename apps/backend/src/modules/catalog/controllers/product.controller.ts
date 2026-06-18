import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { TenantId } from '../../../core/decorators/tenant-id.decorator';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ClerkService } from '../../../core/auth/clerk.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly clerkService: ClerkService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @Body() createProductDto: CreateProductDto,
    @TenantId() tenantId: string,
  ) {
    return this.productService.create(createProductDto, tenantId);
  }

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
    @Req() request?: any,
  ) {
    let isAdmin = false;
    const authHeader = request?.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decodedToken = await this.clerkService.verifyToken(token);
        const userId = decodedToken.sub;
        const clerkUser = await this.clerkService.getUser(userId);

        let userRoles: string[] = [];
        const metadata = clerkUser.publicMetadata || {};
        if (Array.isArray(metadata.roles)) {
          userRoles = metadata.roles;
        } else if (typeof metadata.roles === 'string') {
          userRoles = [metadata.roles];
        } else if (Array.isArray(metadata.role)) {
          userRoles = metadata.role;
        } else if (typeof metadata.role === 'string') {
          userRoles = [metadata.role];
        }

        isAdmin = userRoles.includes('admin');
      } catch {
        // Fallback to non-admin if token verification fails
      }
    }

    return this.productService.findAll(tenantId, search, !isAdmin);
  }

  @Get('active')
  findAllActive(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAllActive(tenantId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    const product = await this.productService.findOne(+id, tenantId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @TenantId() tenantId: string,
  ) {
    return this.productService.update(+id, updateProductDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productService.remove(+id, tenantId);
  }
}
