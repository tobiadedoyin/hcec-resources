import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { PendingJobType } from '../../../enum/jobs.enum';
import { PaymentGateway } from '../../../enum/payment.enum';

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
