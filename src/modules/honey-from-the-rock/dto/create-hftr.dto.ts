import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  lessonNumber: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  memoryVerse?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lessonOutline?: string[];

  @IsOptional()
  @IsArray()
  questions?: string[];

  @IsOptional()
  @IsString()
  lifeApplication?: string[];
}
