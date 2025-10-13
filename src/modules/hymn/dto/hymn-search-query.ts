import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { HymnLanguage } from 'src/enum/hymn.enum';

export class HymnSearchQuery {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNotEmpty()
  search?: string;

  @IsOptional()
  @IsEnum(HymnLanguage)
  language: string;
}
