import { Body, Controller, Post } from '@nestjs/common';
import { CreateGivingDto } from './dto/create-giving.dto';
import { GivingService } from './giving.service';

@Controller('/give')
export class GivingController {
  constructor(private readonly givingService: GivingService) {}

  @Post()
  async makePayment(@Body() data: CreateGivingDto) {
   return await this.givingService.makePayment(data);
  }
}
