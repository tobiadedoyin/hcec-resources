import { DailyHoneyController } from './daily-honey.controller';
import { DailyHoneyService } from './daily-honey.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [
        DailyHoneyController, ],
  providers: [
        DailyHoneyService, ],
})
export class DailyHoneyModule {}
