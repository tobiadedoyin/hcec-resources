import { Controller, Get, Query } from '@nestjs/common';
import { HftrFilterDto } from './dto/get-hftr.dto';
import { HFTRService } from './hftr.service';


@Controller('honey-from-the-rock')
export class HFTRController {
  constructor(private readonly hftrService: HFTRService) {}

  @Get()
  async getHftrLessons(@Query() filter: HftrFilterDto) {
    return await this.hftrService.getHftrLessons(filter);
  }
}
