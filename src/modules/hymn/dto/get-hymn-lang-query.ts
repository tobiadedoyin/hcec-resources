import { IsEnum } from 'class-validator';
import { HymnLanguage } from 'src/enum/hymn.enum';

export class HymnQuery {
  @IsEnum(HymnLanguage)
  language: string;
}
