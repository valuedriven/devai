import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminListOrdersQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  endDate?: string;
}
