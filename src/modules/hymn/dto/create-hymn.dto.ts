import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HymnLanguage } from '../../../enum/hymn.enum';

class CreateVerseDto {
  @IsInt()
  @Type(() => Number)
  number: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  stanza?: number;
}

export class CreateHymnDto {
  @IsEnum(HymnLanguage)
  language: string;

  @IsString()
  title: string;

  @IsNumber()
  number: number;

  @IsOptional()
  @IsString()
  tune: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  bibleVerse?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVerseDto)
  verses?: CreateVerseDto[];
}
