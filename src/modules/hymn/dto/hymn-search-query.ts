import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HymnLanguage } from 'src/enum/hymn.enum';

export class HymnSearchQuery {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;

  @IsOptional()
  number: number;

  @IsEnum(HymnLanguage)
  language: string;
}
