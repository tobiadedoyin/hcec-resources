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
import { HymnLanguage } from 'src/enum/hymn.enum';
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

  // GET /hymns?lang=yoruba
  @Get()
  findAll(@Query('language') lang?: string) {
    const language = this.parseLang(lang);
    return this.hymnService.findAll(language);
  }

  // GET /hymns/filter...
  @Get('filter')
  findByNumberOrTitle(@Query() data: HymnSearchQuery) {
    const language = this.parseLang(data.language);
    return this.hymnService.findByNumberOrTitle({ language, ...data });
  }

  // GET /hymns/:id?lang=english
  @Get(':id')
  findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.parseLang(lang);
    return this.hymnService.findOne(id, language);
  }

  // POST /hymns/:id/verses?lang=yoruba
  @Post(':id/verses')
  addVerse(
    @Param('id') id: string,
    @Body() dto: AddVerseDto,
    @Query('lang') lang?: string,
  ) {
    const language = this.parseLang(lang);
    return this.hymnService.addVerse(id, dto, language);
  }

  // PATCH /hymns/:id  (body: UpdateHymnDto) ?lang=
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHymnDto,
    @Query('lang') lang?: string,
  ) {
    const language = this.parseLang(lang);
    return this.hymnService.update(id, dto, language);
  }

  // DELETE /hymns/:id?lang=
  @Delete(':id')
  remove(@Param('id') id: string, @Query('lang') lang?: string) {
    const language = this.parseLang(lang);
    return this.hymnService.remove(id, language);
  }
}
