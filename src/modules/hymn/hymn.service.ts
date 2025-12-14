import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HymnLanguage } from "src/enum/hymn.enum";
import { AddVerseDto } from "./dto/add-verse.dto";
import { CreateHymnDto } from "./dto/create-hymn.dto";
import { HymnSearchQuery } from "./dto/hymn-search-query";
import { UpdateHymnDto } from "./dto/update-hymn.dto";
import { EnglishHymn, EnglishHymnDocument } from "./schema/english-hymn.schema";
import { YorubaHymn, YorubaHymnDocument } from "./schema/yoruba-hymn.schema";

@Injectable()
export class HymnService {
  constructor(
    @InjectModel(YorubaHymn.name)
    private readonly yorubaHymnModel: Model<YorubaHymnDocument>,

    @InjectModel(EnglishHymn.name)
    private readonly englishHymnModel: Model<EnglishHymnDocument>,
  ) {}

  // Create hymn
  async create(createHymnDto: CreateHymnDto) {
    const model =
      createHymnDto.language === HymnLanguage.ENGLISH
        ? this.englishHymnModel
        : this.yorubaHymnModel;

    const hymn = new model(createHymnDto);
    await hymn.save();

    return {
      message: 'Hymn created successfully',
      data: hymn,
    };
  }

  // Generic paginated fetch
  private async getHymnsAndTotal(
    model: Model<any>,
    conditions: any,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const [hymns, total] = await Promise.all([
      model.find(conditions).lean().skip(skip).limit(limit),
      model.countDocuments(conditions),
    ]);

    return { hymns, total };
  }

  // Search by number or title
  async findByNumberOrTitle(
    page: number = 1,
    limit: number = 20,
    query: HymnSearchQuery,
  ) {
    const { search, language } = query;

    const [primaryModel, fallbackModel, primaryLang, fallbackLang] =
      language === HymnLanguage.ENGLISH
        ? [
            this.englishHymnModel,
            this.yorubaHymnModel,
            HymnLanguage.ENGLISH,
            HymnLanguage.YORUBA,
          ]
        : [
            this.yorubaHymnModel,
            this.englishHymnModel,
            HymnLanguage.YORUBA,
            HymnLanguage.ENGLISH,
          ];

    const conditions: any = {};

    if (search) {
      const input = String(search).trim();
      const num = parseInt(input, 10);
      if (!isNaN(num) && String(num) === input) {
        conditions.number = num;
      } else {
        conditions.title = { $regex: input, $options: 'i' };
      }
    }

    let result = await this.getHymnsAndTotal(
      primaryModel,
      conditions,
      page,
      limit,
    );
    let foundInLang = primaryLang;

    if (result.hymns.length === 0) {
      result = await this.getHymnsAndTotal(fallbackModel, conditions, page, limit);
      if (result.hymns.length > 0) foundInLang = fallbackLang;
    }

    return {
      message:
        result.hymns.length > 0
          ? `Hymns found successfully (Language: ${foundInLang})`
          : `No hymns found for search query.`,
      count: result.hymns.length,
      data: {
        hymns: result.hymns,
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: page * limit < result.total,
        },
      },
    };
  }

  // Memory-safe findAll with pagination
  async findAll(
    lang: HymnLanguage = HymnLanguage.ENGLISH,
    page: number = 1,
    limit: number = 50,
  ) {
    const model =
      lang === HymnLanguage.ENGLISH
        ? this.englishHymnModel
        : this.yorubaHymnModel;

    const { hymns, total } = await this.getHymnsAndTotal(model, {}, page, limit);

    return {
      message: `${lang} Hymns retrieved successfully`,
      data: hymns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single hymn
  async findOne(id: string, lang: HymnLanguage = HymnLanguage.ENGLISH) {
    const model =
      lang === HymnLanguage.ENGLISH
        ? this.englishHymnModel
        : this.yorubaHymnModel;

    const hymn = await model.findOne({ _id: id, language: lang }).lean();
    if (!hymn) throw new NotFoundException('Hymn not found');

    return {
      message: `${lang} Hymn retrieved successfully`,
      data: hymn,
    };
  }

  // Add verse
  async addVerse(hymnId: string, dto: AddVerseDto, lang: HymnLanguage = HymnLanguage.ENGLISH) {
    const model =
      lang === HymnLanguage.ENGLISH ? this.englishHymnModel : this.yorubaHymnModel;

    const exists = await model.findOne({ _id: hymnId, 'verses.number': dto.number });
    if (exists) throw new BadRequestException('Verse with that number already exists');

    const updated = await model.updateOne({ _id: hymnId }, { $addToSet: { verses: dto } });
    return {
      message: 'New verse added successfully',
      data: updated,
    };
  }

  // Update hymn
  async update(hymnId: string, dto: UpdateHymnDto, lang: HymnLanguage = HymnLanguage.ENGLISH) {
    const model =
      lang === HymnLanguage.ENGLISH ? this.englishHymnModel : this.yorubaHymnModel;

    const hymn = await model.findByIdAndUpdate(hymnId, dto, { new: true });
    if (!hymn) throw new NotFoundException('Hymn not found');

    return {
      message: 'Hymn updated successfully',
      data: hymn,
    };
  }

  // Delete hymn
  async remove(hymnId: string, lang: HymnLanguage = HymnLanguage.ENGLISH) {
    const model =
      lang === HymnLanguage.ENGLISH ? this.englishHymnModel : this.yorubaHymnModel;

    const hymn = await model.findByIdAndDelete(hymnId);
    if (!hymn) throw new NotFoundException('Hymn not found');

    return {
      message: 'Hymn deleted successfully',
      deleted: true,
    };
  }
}
