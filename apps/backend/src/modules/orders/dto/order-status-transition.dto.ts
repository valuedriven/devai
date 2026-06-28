import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../services/order-management.service';

export class OrderStatusTransitionDto {
  @IsEnum(OrderStatus)
  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  notes?: string;
}
