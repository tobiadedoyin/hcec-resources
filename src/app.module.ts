import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
// import { JobModule } from './jobs/job.module';
import { DailyHoneyModule } from './modules/daily-honey/daily-honey.module';
import { GivingModule } from './modules/giving/giving.module';
import { HFTRController } from './modules/honey-from-the-rock/hftr.controller';
import { HFTRModule } from './modules/honey-from-the-rock/hftr.module';
import { HFTRService } from './modules/honey-from-the-rock/hftr.service';
import { HymnModule } from './modules/hymn/hymn.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PersistJobTaskModule } from './modules/persist-job-task/persist-job-task.module';
import { HealthController } from './health.controller';

// const jobImports =
//   process.env.RUN_JOBS === 'true' ? [ScheduleModule.forRoot(), JobModule] : [];

@Module({
  imports: [
    // PaymentModule,
    // PersistJobTaskModule,
    // ...jobImports,
    GivingModule,
    HymnModule,
    HFTRModule,
    DailyHoneyModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // MongooseModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGO_URI'),
    //   }),
    // }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('MONGO_URI'),
      autoIndex: false,        // prevents index build on startup
      maxPoolSize: 5,          // reduce memory footprint
      serverSelectionTimeoutMS: 5000, // avoid long retries
  }),
}),

  ],
  controllers: [HFTRController, HealthController],
  providers: [HFTRService],
})
export class AppModule {}
