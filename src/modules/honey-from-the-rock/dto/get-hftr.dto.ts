import { IsEnum, IsString } from 'class-validator';
import { HftrLanguage, HftrType } from '../../../enum/hftr.enum';

export class HftrFilterDto {
  @IsString()
  @IsEnum(HftrType)
  type: string;

  @IsString()
  @IsEnum(HftrLanguage)
  language: HftrLanguage;

  @IsString()
  lesson: string;
}
