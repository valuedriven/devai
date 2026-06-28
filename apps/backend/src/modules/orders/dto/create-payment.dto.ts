import {
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../services/payment.service';

export class CreatePaymentDto {
  @IsNumber()
  @ApiProperty()
  value: number;

  @IsString()
  @ApiProperty()
  method: string;

  @IsDateString()
  @ApiProperty()
  date: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @ApiProperty({ enum: PaymentStatus, required: false })
  status?: PaymentStatus;
}
