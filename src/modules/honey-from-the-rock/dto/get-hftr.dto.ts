import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { HftrLanguage, HftrType } from 'src/enum/hftr.enum';

export class HftrFilterDto {
  @IsString()
  @IsEnum(HftrType)
  type: string;

  @IsString()
  @IsEnum(HftrLanguage)
  language: HftrLanguage;

  @IsOptional()
  @IsString()
  lesson?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}