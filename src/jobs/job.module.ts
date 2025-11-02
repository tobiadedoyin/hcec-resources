import { Module } from '@nestjs/common';
import { GivingModule } from 'src/modules/giving/giving.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { PersistJobTaskModule } from '../modules/persist-job-task/persist-job-task.module';
import { PaymentCleanupService } from './payment-cleanup.service';
import { PendingJobService } from './pending-job.service';

@Module({
  imports: [PersistJobTaskModule, PaymentModule, GivingModule],
  controllers: [],
  providers: [PendingJobService, PaymentCleanupService],
  exports: [PendingJobService, PaymentCleanupService],
})
export class JobModule {}
