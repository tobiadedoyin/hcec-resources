import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HymnLanguage } from 'src/enum/hymn.enum';

class CreateVerseDto {
  @Type(() => Number)
  number: number;

  @IsString()
  text: string;

  @IsOptional()
  @Type(() => Number)
  stanza?: number;
}

export class CreateHymnDto {
  @IsEnum(HymnLanguage)
  language: string;

  @IsString()
  title: string;

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
