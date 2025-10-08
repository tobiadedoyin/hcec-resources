import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HymnLanguage } from 'src/enum/hymn.enum';
import { AddVerseDto } from './dto/add-verse.dto';
import { CreateHymnDto } from './dto/create-hymn.dto';
import { HymnSearchQuery } from './dto/hymn-search-query';
import { UpdateHymnDto } from './dto/update-hymn.dto';
import { EnglishHymn, EnglishHymnDocument } from './schema/english-hymn.schema';
import { YorubaHymn, YorubaHymnDocument } from './schema/yoruba-hymn.schema';

@Injectable()
export class HymnService {
  constructor(
    @InjectModel(YorubaHymn.name)
    private readonly yorubaHymnModel: Model<YorubaHymnDocument>,

    @InjectModel(EnglishHymn.name)
    private readonly englishHymnModel: Model<EnglishHymnDocument>,
  ) {}

  async create(createHymnDto: CreateHymnDto) {
    let hymn: any;

    if (createHymnDto.language === HymnLanguage.ENGLISH) {
      hymn = new this.englishHymnModel(createHymnDto);
    } else if (createHymnDto.language === HymnLanguage.YORUBA) {
      hymn = new this.yorubaHymnModel(createHymnDto);
    }

    await hymn.save();

    return {
      message: 'hymn created successfully',
      data: hymn,
    };
  }

  async findByNumberOrTitle(query: HymnSearchQuery) {
    const { search, number, language } = query;

    let model: any;
    if (language === HymnLanguage.ENGLISH) {
      model = this.englishHymnModel;
    } else if (language === HymnLanguage.YORUBA) {
      model = this.yorubaHymnModel;
    } else {
      throw new BadRequestException('Invalid or missing language');
    }

    const conditions: any = {};

    if (number) {
      conditions.number = number;
    } else if (search) {
      conditions.title = { $regex: search, $options: 'i' };
    } else {
      throw new BadRequestException(
        'Please provide a search term or hymn number',
      );
    }

    const hymns = await model.find(conditions).lean();

    if (!hymns || hymns.length === 0) {
      throw new NotFoundException(
        'No hymns found for the given search criteria',
      );
    }

    return {
      message: `${language} hymns found successfully`,
      count: hymns.length,
      data: hymns,
    };
  }

  async findAll(lang: HymnLanguage = HymnLanguage.ENGLISH) {
    let hymns: any;

    if (lang === HymnLanguage.ENGLISH) {
      hymns = await this.englishHymnModel.find().lean();
    } else if (lang === HymnLanguage.YORUBA) {
      hymns = await this.yorubaHymnModel.find().lean();
    }

    return {
      message: `${lang} Hymns retrieved successfully`,
      data: hymns,
    };
  }

  async findOne(id: string, lang: HymnLanguage = HymnLanguage.ENGLISH) {
    //TODO replace with search query
    let hymn: any;

    if (lang === HymnLanguage.ENGLISH) {
      hymn = await this.englishHymnModel
        .findOne({ id, language: HymnLanguage.ENGLISH })
        .lean();
    } else if (lang === HymnLanguage.YORUBA) {
      hymn = await this.yorubaHymnModel
        .findOne({ id, language: HymnLanguage.YORUBA })
        .lean();
    }

    if (!hymn) {
      throw new NotFoundException('Hymn not found');
    }

    return {
      message: `${lang} Hymn retrieved successfully`,
      data: hymn,
    };
  }

  async addVerse(
    hymnId: string,
    dto: AddVerseDto,
    lang: HymnLanguage = HymnLanguage.ENGLISH,
  ) {
    let updatedHymn: any;

    if (lang === HymnLanguage.ENGLISH) {
      const exists = await this.englishHymnModel.findOne({
        _id: hymnId,
        'verses.number': dto.number,
      });

      if (exists)
        throw new BadRequestException('Verse with that number already exists');

      updatedHymn = await this.englishHymnModel.updateOne(
        { _id: hymnId },
        { $addToSet: { verses: dto } },
      );
    } else if (lang === HymnLanguage.YORUBA) {
      const exists = await this.yorubaHymnModel.findOne({
        _id: hymnId,
        'verses.number': dto.number,
      });

      if (exists)
        throw new BadRequestException('Verse with that number already exists');

      updatedHymn = await this.yorubaHymnModel.updateOne(
        { _id: hymnId },
        { $addToSet: { verses: dto } },
      );
    }

    return {
      message: `new verse added successfully`,
      data: updatedHymn,
    };
  }

  //   async updateVerse(hymnId: string, verseNumber: number, text: string) {
  //     const res = await this.hymnModel.updateOne(
  //       { _id: hymnId, 'verses.number': verseNumber },
  //       { $set: { 'verses.$.text': text } },
  //     );
  //     if (res.matchedCount === 0) throw new NotFoundException('Verse not found');
  //     return this.getVerseByNumber(hymnId, verseNumber);
  //   }

  //   async removeVerse(hymnId: string, verseNumber: number) {
  //     const hymn = await this.hymnModel.findById(hymnId);
  //     if (!hymn) throw new NotFoundException('Hymn not found');

  //     const beforeLength = hymn.verses.length;
  //     hymn.verses = hymn.verses.filter((v) => v.number !== verseNumber);
  //     if (hymn.verses.length === beforeLength)
  //       throw new NotFoundException('Verse not found');

  //     // renumber
  //     hymn.verses.forEach((v, i) => (v.number = i + 1));
  //     await hymn.save();
  //     return hymn;
  //   }

  //   async reorderVerses(hymnId: string, newOrder: number[]) {
  //     const hymn = await this.hymnModel.findById(hymnId);
  //     if (!hymn) throw new NotFoundException('Hymn not found');

  //     if (newOrder.length !== hymn.verses.length) {
  //       throw new BadRequestException(
  //         'New order length does not match verses length',
  //       );
  //     }

  //     const map = new Map<number, any>();
  //     hymn.verses.forEach((v) =>
  //       map.set(v.number, v.toObject ? v.toObject() : v),
  //     );

  //     const reordered = newOrder.map((num, i) => {
  //       const v = map.get(num);
  //       if (!v) throw new BadRequestException(`Verse number ${num} not found`);
  //       v.number = i + 1;
  //       return v;
  //     });

  //     hymn.verses = reordered as any;
  //     await hymn.save();
  //     return hymn;
  //   }

  async update(
    hymnId: string,
    dto: UpdateHymnDto,
    lang: HymnLanguage = HymnLanguage.ENGLISH,
  ) {
    let hymn: any;

    if (lang === HymnLanguage.ENGLISH) {
      hymn = await this.englishHymnModel.findByIdAndUpdate(hymnId, dto, {
        new: true,
      });
    } else if (lang === HymnLanguage.YORUBA) {
      hymn = await this.yorubaHymnModel.findByIdAndUpdate(hymnId, dto, {
        new: true,
      });
    }

    if (!hymn) throw new NotFoundException('Hymn not found');

    return {
      message: 'hymn updated successfully',
      data: hymn,
    };
  }

  async remove(hymnId: string, lang: HymnLanguage = HymnLanguage.ENGLISH) {
    let hymn: any;

    if (lang === HymnLanguage.ENGLISH) {
      hymn = await this.englishHymnModel.findByIdAndDelete(hymnId);
    } else if (lang === HymnLanguage.YORUBA) {
      hymn = await this.yorubaHymnModel.findByIdAndDelete(hymnId);
    }

    if (!hymn) throw new NotFoundException('Hymn not found');

    return {
      message: 'hymn deleted successfully',
      deleted: true,
    };
  }
}
