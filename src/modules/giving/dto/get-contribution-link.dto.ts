import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryContributionLinkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentLink: string;

  @IsOptional()
  @IsNumber()
  priceGoal: number;
}
