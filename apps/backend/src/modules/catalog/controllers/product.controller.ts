import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Public } from '../../../core/decorators/public.decorator';
import { ClerkService } from '../../../core/auth/clerk.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly clerkService: ClerkService,
  ) {}

  @Post()
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Public()
  @Get()
  async findAll(@Query('search') search?: string, @Req() request?: any) {
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

    return this.productService.findAll(search, !isAdmin);
  }

  @Public()
  @Get('active')
  findAllActive(@Query('search') search?: string) {
    return this.productService.findAllActive(search);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
