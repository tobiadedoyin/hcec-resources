import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DailyHoneyQuery {
  @IsOptional()
  @IsString()
  day: string;

  @IsOptional()
  @IsString()
  month: string;

  @IsOptional()
  @IsNumber()
  year: number;
}
//TODO add strick value to enum for day