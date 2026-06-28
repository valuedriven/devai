import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class AdminCreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0, { message: 'Stock must be greater than or equal to 0' })
  stock: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
