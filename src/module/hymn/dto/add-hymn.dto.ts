import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class AddHymnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1)
  number: number; // Hymn number

  @IsOptional()
  @IsString()
  tune?: string; // Melody or tune name

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bibleReferences?: string[]; // Related Bible verses

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  verses: string[]; // Array of hymn verses

  @IsOptional()
  @IsString()
  chorus?: string; // Optional chorus field

  @IsString()
  @IsNotEmpty()
  category: string; // e.g., Worship, Thanksgiving, Praise

  @IsOptional()
  @IsString()
  author?: string; // Optional field
}
