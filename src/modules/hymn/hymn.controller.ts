/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HymnLanguage } from '../../enum/hymn.enum';
import { AddVerseDto } from './dto/add-verse.dto';
import { CreateHymnDto } from './dto/create-hymn.dto';
import { HymnSearchQuery } from './dto/hymn-search-query';
import { UpdateHymnDto } from './dto/update-hymn.dto';
import { HymnService } from './hymn.service';
@Controller('hymns')
export class HymnsController {
  constructor(private readonly hymnService: HymnService) {}

  private parseLang(lang?: string): HymnLanguage {
    if (!lang) return HymnLanguage.ENGLISH;
    const found = Object.values(HymnLanguage).find(
      (v) => String(v).toLowerCase() === String(lang).toLowerCase(),
    );
    return (found as HymnLanguage) ?? HymnLanguage.ENGLISH;
  }

  @Post()
  create(@Body() dto: CreateHymnDto) {
    return this.hymnService.create(dto);
  }

  @Get()
  findAll(@Query('language') lang?: string) {
    const language = this.parseLang(lang);
    return this.hymnService.findAll(language);
  }

  @Get('filter')
  findByNumberOrTitle(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query() data: HymnSearchQuery,
  ) {
    return this.hymnService.findByNumberOrTitle(page, limit, data);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.parseLang(lang);
    return this.hymnService.findOne(id, language);
  }

  @Post(':id/verses')
  addVerse(
    @Param('id') id: string,
    @Body() dto: AddVerseDto,
    @Query('lang') lang?: string,
  ) {
    const language = this.parseLang(lang);
    return this.hymnService.addVerse(id, dto, language);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHymnDto,
    @Query('lang') lang?: string,
  ) {
    const language = this.parseLang(lang);
    return this.hymnService.update(id, dto, language);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.parseLang(lang);
    return this.hymnService.remove(id, language);
  }
}
