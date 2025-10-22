import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersistJobTaskService } from './persist-job-task.service';
import { PendingJob, PendingJobSchema } from './schema/pending-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingJob.name, schema: PendingJobSchema },
    ]),
  ],
  controllers: [],
  providers: [PersistJobTaskService],
  exports: [PersistJobTaskService],
})
export class PersistJobTaskModule {}
