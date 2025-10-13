import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DailyHoneyQuery {
  @IsOptional()
  @IsNumber()
  day: number;

  @IsOptional()
  @IsString()
  topic: string;
}
