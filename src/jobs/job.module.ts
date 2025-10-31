import { Module } from '@nestjs/common';
import { GivingModule } from 'src/modules/giving/giving.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { PersistJobTaskModule } from 'src/modules/persist-job-task/persist-job-task.module';
import { PendingJobService } from './pending-job.service';
import { PaymentCleanupService } from './payment-cleanup.service';

@Module({
  imports: [PersistJobTaskModule, PaymentModule, GivingModule],
  controllers: [],
  providers: [PendingJobService, PaymentCleanupService],
  exports: [PendingJobService],
})
export class JobModule {}
