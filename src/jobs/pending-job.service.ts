import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PendingJobType } from '../enum/jobs.enum';
import { PaymentGateway, PaymentStatus } from '../enum/payment.enum';
import { UpdateTransactionDto } from '../modules/payment/dto/update-transaction.dto';
import { PaymentService } from '../modules/payment/payment.service';
import { PersistJobTaskService } from '../modules/persist-job-task/persist-job-task.service';
import { PendingJobDocument } from '../modules/persist-job-task/schema/pending-job.schema';

@Injectable()
export class PendingJobService {
  private readonly logger = new Logger(PendingJobService.name);
  private running = false;

  constructor(
    private readonly paymentService: PaymentService,

    private readonly persistJobTaskService: PersistJobTaskService,
  ) {}

  private async handlePaymentUpdate(
    status: PaymentStatus,
    paymentMethod: string,
    transactionRefrence: string,
    customerEmail: string,
  ) {
    const data: UpdateTransactionDto = {
      status,
      paymentMethod,
      transactionRefrence,
    };

    await this.paymentService.updateTransactionDocument(data);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processJobs() {
    if (this.running) {
      this.logger.warn('Previous pending-job run still running — skipping this tick');
      return;
    }

    this.running = true;
    try {
      const now = new Date();

      const job = await this.persistJobTaskService.getPendingJobs(now);

      if (!job) {
        this.logger.debug('No pending job found');
        return;
      }

      try {
        await this.handleJob(job);
        await this.persistJobTaskService.updateJob(job._id, { status: 'done' });
        this.logger.log(`✅ Job ${job._id} completed`);
      } catch (err) {
        const nextDelay = Math.min(
          60_000 * Math.pow(2, job.attempts),
          60 * 60 * 1000,
        );
        const update: any = {
          lastError: err.message,
          lockedAt: null,
        };

        if (job.attempts >= job.maxAttempts) {
          update.status = 'failed';
          this.logger.warn(
            `❌ Job ${job._id} failed permanently: ${err.message}`,
          );
        } else {
          update.status = 'pending';
          update.nextAttemptAt = new Date(Date.now() + nextDelay);
          this.logger.warn(`⚠️ Job ${job._id} failed; retrying later`);
        }

        await this.persistJobTaskService.updateJob(job._id, update);
      }
    } finally {
      this.running = false;
    }
  }

  async handleJob(job: PendingJobDocument) {
    if (job.type === PendingJobType.GIVING_STATUS_UPDATE) {
      const { gateway, data } = job.payload;

      const body = data;

      if (gateway === PaymentGateway.PAYSTACK) {
        await this.handlePaymentUpdate(
          body?.status === 'success'
            ? PaymentStatus.SUCCESS
            : PaymentStatus.FAILED,
          body?.channel,
          body?.reference,
          body?.customer.email,
        );
      }

      if (gateway === PaymentGateway.FLUTTER) {
        await this.handlePaymentUpdate(
          body.status === 'successful'
            ? PaymentStatus.SUCCESS
            : PaymentStatus.FAILED,
          body['event.type'] || null,
          body.txRef,
          body.customer?.email?.replace(/^ravesb_[^_]+_/, '') || null,
        );
      }
    }
  }
}
