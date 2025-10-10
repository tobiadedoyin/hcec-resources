import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDailyHoneyDto {
  @IsNotEmpty()
  @IsString()
  day: string;

  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  scriptureInFocus?: string;

  @IsOptional()
  @IsString()
  learnByHeart?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  challenge?: string;

  @IsOptional()
  @IsString()
  prayer?: string;
}
