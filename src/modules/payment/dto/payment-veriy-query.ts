import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class PaymentVerifyQuery {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tx_ref: string;


  @ValidateIf((o) => o.tx_ref !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'tx_id is required when tx_ref is provided' })
  tx_id: string;
}
