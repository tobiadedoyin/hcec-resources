import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { PendingJobType } from 'src/enum/jobs.enum';
import { PaymentGateway } from 'src/enum/payment.enum';

export class CreatePendingJob {
  @IsEnum(PendingJobType)
  type: string;

  @IsObject()
  payload: any;

  @IsOptional()
  @IsEnum(PaymentGateway)
  gateway?: string;

  @IsOptional()
  maxAttempts?: number;
}
