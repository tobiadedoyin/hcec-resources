import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { PendingJobService } from './pending-job.service';
import { PersistJobTaskModule } from 'src/modules/persist-job-task/persist-job-task.module';

@Module({
  imports: [
    PersistJobTaskModule,
    PaymentModule
  ],
  controllers: [],
  providers: [PendingJobService],
  exports: [PendingJobService],
})
export class JobModule {}
