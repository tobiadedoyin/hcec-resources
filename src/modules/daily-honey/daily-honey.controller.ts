import { Body, Controller, Get } from '@nestjs/common';
import { DailyHoneyService } from './daily-honey.service';
import { DailyHoneyQuery } from './dto/get-daily-honey-query.dto';

@Controller()
export class DailyHoneyController {
  constructor(private readonly dailyHoneyService: DailyHoneyService) {}

  @Get('/daily-honey')
  async getDailyHoney(@Body() data: DailyHoneyQuery = null) {
    return await this.dailyHoneyService.getDailyHoney(data);
  }
}
