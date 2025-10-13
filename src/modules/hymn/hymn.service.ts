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


async getHymnsAndTotal(
  model: any,
  conditions: any,
  skip: number,
  limit: number,
) {
  const [hymns, total] = await Promise.all([
    model.find(conditions).skip(skip).limit(limit).lean(),
    model.countDocuments(conditions),
  ]);

  return { hymns, total };
}

async findByNumberOrTitle(
  page: number = 1,
  limit: number = 20,
  query: HymnSearchQuery,
) {
  const { search, language } = query;
  const skip = (page - 1) * limit;

  let primaryModel: any;
  let fallbackModel: any;
  let primaryLanguage: HymnLanguage;
  let fallbackLanguage: HymnLanguage;

  if (language === HymnLanguage.ENGLISH) {
    primaryModel = this.englishHymnModel;
    fallbackModel = this.yorubaHymnModel;
    primaryLanguage = HymnLanguage.ENGLISH;
    fallbackLanguage = HymnLanguage.YORUBA;
  } else if (language === HymnLanguage.YORUBA) {
    primaryModel = this.yorubaHymnModel;
    fallbackModel = this.englishHymnModel;
    primaryLanguage = HymnLanguage.YORUBA;
    fallbackLanguage = HymnLanguage.ENGLISH;
  } else {
    throw new BadRequestException('Invalid or missing language');
  }

  const conditions: any = {};
  if (search) {
    const searchInput = String(search).trim();
    const numericSearch = parseInt(searchInput, 10);

    if (!isNaN(numericSearch) && String(numericSearch) === searchInput) {
      conditions.number = numericSearch;
    } else {
      conditions.title = { $regex: searchInput, $options: 'i' };
    }
  }

  let result = await this.getHymnsAndTotal(
    primaryModel,
    conditions,
    skip,
    limit,
  );
  let foundInLanguage = primaryLanguage;

  if (result.hymns.length === 0) {
    result = await this.getHymnsAndTotal(
      fallbackModel,
      conditions,
      skip,
      limit,
    );

    if (result.hymns.length > 0) {
      foundInLanguage = fallbackLanguage;
    }
  }

  const { hymns, total } = result;

  return {
    message:
      hymns.length > 0
        ? `Hymns found successfully (Language: ${foundInLanguage})`
        : `No hymns found for search query.`,
    count: hymns.length,
    data: {
      hymns,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    },
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
