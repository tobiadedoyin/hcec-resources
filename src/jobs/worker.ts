import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { JobModule } from './job.module';
import { PaymentCleanupService } from './payment-cleanup.service';
import { PendingJobService } from './pending-job.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({ uri: cs.get<string>('MONGO_URI') }),
    }),
    JobModule,
  ],
})
class WorkerModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  const pendingJobService = app.get(PendingJobService);
  const paymentJobService = app.get(PaymentCleanupService);

  const pendingIntervalMs = 30 * 60 * 1000;;
  const cleanupIntervalMs = 60 * 60 * 1000; 

  await Promise.all([
    pendingJobService.processJobs(),
    paymentJobService.handleCron(),
  ]);

  const pendingTimer = setInterval(async () => {
    try {
      await pendingJobService.processJobs();
    } catch (err) {
      console.error('Pending job tick error', err);
    }
  }, pendingIntervalMs);

  const cleanupTimer = setInterval(async () => {
    try {
      await paymentJobService.handleCron();
    } catch (err) {
      console.error('Payment cleanup tick error', err);
    }
  }, cleanupIntervalMs);


  process.on('SIGINT', async () => {
    clearInterval(pendingTimer);
    await app.close();
    process.exit();
  });

  process.on('SIGTERM', async () => {
    clearInterval(cleanupTimer);
    try {
      await app.close();
    } finally {
      process.exit(0);
    }
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection in worker:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception in worker:', err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Worker bootstrap failed', err);
  process.exit(1);
});
