import { MongooseModule } from '@nestjs/mongoose';
import { DailyHoneyController } from './daily-honey.controller';
import { DailyHoneyService } from './daily-honey.service';

import { Module } from '@nestjs/common';
import { DailyHoney, DailyHoneySchema } from './schema/daily-honey.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyHoney.name, schema: DailyHoneySchema },
    ]),
  ],
  controllers: [DailyHoneyController],
  providers: [DailyHoneyService],
})
export class DailyHoneyModule {}
