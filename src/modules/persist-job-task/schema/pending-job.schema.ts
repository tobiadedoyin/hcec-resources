import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PendingJobStatus, PendingJobType } from 'src/enum/jobs.enum';

@Schema({ timestamps: true })
export class PendingJob {
  @Prop({ type: String, enum: PendingJobType })
  type: string;

  @Prop({ type: Object })
  payload: any;

  @Prop({ default: 'pending' })
  status: PendingJobStatus;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 5 })
  maxAttempts: number;

  @Prop()
  lockedAt?: Date;

  @Prop({ default: Date.now })
  nextAttemptAt: Date;

  @Prop()
  lastError?: string;
}

export type PendingJobDocument = PendingJob & Document;
export const PendingJobSchema = SchemaFactory.createForClass(PendingJob);
