import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'The updated name of the category',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'The active status of the category' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
