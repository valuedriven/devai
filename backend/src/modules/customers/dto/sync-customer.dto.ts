import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SyncCustomerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
