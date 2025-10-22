import { IsEnum, IsString } from 'class-validator';
import { PaymentStatus } from 'src/enum/payment.enum';

export class UpdateTransactionDto {
  @IsEnum(PaymentStatus)
  @IsString()
  status: PaymentStatus;

  @IsString()
  paymentMethod: string;

  @IsString()
  transactionRefrence: string;
}
