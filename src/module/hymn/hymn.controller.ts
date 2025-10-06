import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HymnsService } from './hymn.service';
import { AddHymnDto } from './dto/add-hymn.dto';

@Controller('hymns')
export class HymnsController {
  constructor(private readonly hymnsService: HymnsService) {}

  @Post()
  async createHymn(
    @Body()
    body: AddHymnDto,
  ) {
    return this.hymnsService.createHymn(body);
  }

  @Get('search')
  async getHymn(@Query('search') search: string) {
    return this.hymnsService.findByNumberOrTitle(search);
  }

  @Get()
  async getAllHymns() {
    return this.hymnsService.findAll();
  }
}
