import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PendingJobType } from 'src/enum/jobs.enum';
import { CreatePendingJob } from './dto/create-pending.dto';
import { PendingJob, PendingJobDocument } from './schema/pending-job.schema';

@Injectable()
export class PersistJobTaskService {
  private readonly logger = new Logger(PersistJobTaskService.name);

  constructor(
    @InjectModel(PendingJob.name)
    private readonly pendingJobModel: Model<PendingJobDocument>,
  ) {}

  async createPendingJob(data: CreatePendingJob) {
    const job = await this.pendingJobModel.create(data);
    return job;
  }

  async getPendingJobs(now: Date) {
    const job = await this.pendingJobModel.findOneAndUpdate(
      {
        status: 'pending',
        nextAttemptAt: { $lte: now },
      },
      {
        $set: { status: 'processing', lockedAt: now },
        $inc: { attempts: 1 },
      },
      { sort: { createdAt: 1 }, new: true },
    );

    return job;
  }

  async updateJob(jobId: any, data: any) {
    const updatedJob = await this.pendingJobModel.findByIdAndUpdate(
      jobId,
      data,
      { new: true },
    );

    if (!updatedJob) {
      this.logger.error('job could not be updated');
    }
  }
}
