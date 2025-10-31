import { IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGivingDto {
  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsEmail()
  email?: string = 'church@gmal.com';

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;
}
