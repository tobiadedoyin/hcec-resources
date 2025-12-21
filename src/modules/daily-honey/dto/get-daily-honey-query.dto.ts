import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Month } from 'src/enum/daily-honey.enum';

export class DailyHoneyQuery {
  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  @IsEnum(Month)
  month?: string;

  @IsOptional()
  @IsNumber()
  year?: number;
}
