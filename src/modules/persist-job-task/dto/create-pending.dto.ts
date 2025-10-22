import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { PendingJobType } from 'src/enum/jobs.enum';

export class CreatePendingJob {
  @IsEnum(PendingJobType)
  type: string;

  @IsObject()
  payload: any;

  @IsOptional()
  maxAttempts?: number;
}
