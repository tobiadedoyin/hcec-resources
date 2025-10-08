import { HymnModule } from './modules/hymn/hymn.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyHoneyModule } from './modules/daily-honey/daily-honey.module';
import { HFTRController } from './modules/honey-from-the-rock/hftr.controller';
import { HFTRModule } from './modules/honey-from-the-rock/hftr.module';
import { HFTRService } from './modules/honey-from-the-rock/hftr.service';

@Module({
  imports: [
    HymnModule,
    HFTRModule,
    DailyHoneyModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
  ],
  controllers: [HFTRController],
  providers: [HFTRService],
})
export class AppModule {}
