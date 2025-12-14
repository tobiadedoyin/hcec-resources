import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ContributionLinkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  paymentLink: string;

  @IsOptional()
  @IsNumber()
  priceGoal: number;
}
