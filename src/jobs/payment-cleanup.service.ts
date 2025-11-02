import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GivingService } from 'src/modules/giving/giving.service';

@Injectable()
export class PaymentCleanupService {
  private readonly logger = new Logger(PaymentCleanupService.name);
  private running = false;

  constructor(private readonly givingService: GivingService) {}
 
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    if (this.running) {
      this.logger.warn('Previous cleanup still running — skipping this tick');
      return;
    }

    this.running = true;
    this.logger.debug('Payment cleanup job started');

    try {
      const now = new Date();
      const payments = await this.givingService.getOrphanedPayments();

      if (!Array.isArray(payments) || payments.length === 0) {
        this.logger.debug('No orphaned payments found');
        return;
      } 

      for (const p of payments) {
        if (!p || !p._id) continue;

        const expiresAt = p.expiresAt ? new Date(p.expiresAt) : null;
        if (!expiresAt) {
          this.logger.warn(`Payment ${p._id} has no expiresAt — skipping`);
          continue;
        }
        if (expiresAt > now) continue;

        let transactionId: string | null = null;
        const tx = (p as any).transaction;
        if (tx) {
          if (typeof tx === 'string') {
            transactionId = tx;
          } else if (typeof tx === 'object') {
            transactionId = tx.id ?? tx.transactionId ?? null;
            if (transactionId && typeof transactionId !== 'string')
              transactionId = String(transactionId);
          }
        }

        try {
          await this.givingService.deleteGiving(
            p._id.toString(),
            transactionId,
          );
          this.logger.log(
            `Deleted giving ${p._id} (tx: ${transactionId ?? 'none'})`,
          );
        } catch (err) {
          this.logger.error(
            `Failed to delete giving ${p._id}: ${err?.message ?? err}`,
            err?.stack,
          );
        }
      }
    } catch (err) {
      this.logger.error('Payment cleanup job failed', err?.stack ?? err);
    } finally {
      this.running = false;
      this.logger.debug('Payment cleanup job finished');
    }
  }
} 
 