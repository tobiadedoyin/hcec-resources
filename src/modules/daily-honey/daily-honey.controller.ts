import { Body, Controller, Get, Query } from '@nestjs/common';
import { DailyHoneyService } from './daily-honey.service';
import { DailyHoneyQuery } from './dto/get-daily-honey-query.dto';

@Controller()
export class DailyHoneyController {
  constructor(private readonly dailyHoneyService: DailyHoneyService) {}

  @Get('/daily-honey')
  async getDailyHoney(@Query() data?: DailyHoneyQuery) {
    return await this.dailyHoneyService.getDailyHoney(data);
  }
}
