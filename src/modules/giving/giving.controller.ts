import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateGivingDto } from './dto/create-giving.dto';
import { ContributionLinkDto } from './dto/save-contribution-link.dto';
import { GivingService } from './giving.service';

@Controller('/give')
export class GivingController {
  constructor(private readonly givingService: GivingService) {}

  @Post()
  async makePayment(@Body() data: CreateGivingDto) {
    return await this.givingService.makePayment(data);
  }

  @Post('link')
  async saveContributionLink(@Body() data: ContributionLinkDto) {
    return await this.givingService.saveContributionLink(data);
  }

  @Get('link')
  async getContributionLink() {
    return await this.givingService.getContributionLink();
  }

  @Delete('link/:id')
  async deleteContributionLink(@Param('id') id: string) {
    return await this.givingService.deleteContributionLink(id);
  }
}
