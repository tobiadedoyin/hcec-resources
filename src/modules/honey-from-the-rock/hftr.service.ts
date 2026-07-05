/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HftrLanguage, HftrType } from 'src/enum/hftr.enum';
import { HftrFilterDto } from './dto/get-hftr.dto';
import { YorubaMapper } from './english-yoruba-number.helper';
import {
  AdultEnglishHFTR,
  AdultEnglishHFTRDocument,
} from './schema/adult-english-hftr.schema';
import {
  AdultFRENCHHFTR,
  AdultFRENCHHFTRDocument,
} from './schema/adult-french-hftr.schema';
import {
  ChildrenEnglishHFTR,
  ChildrenEnglishHFTRDocument,
} from './schema/children-english-hftr.schema';
import {
  ChildrenFRENCHHFTR,
  ChildrenFRENCHHFTRDocument,
} from './schema/children-french-hftr.schema';

@Injectable()
export class HFTRService {
  constructor(
    @InjectModel(ChildrenEnglishHFTR.name)
    private readonly childEngHftrModel: Model<ChildrenEnglishHFTRDocument>,

    @InjectModel(AdultEnglishHFTR.name)
    private readonly adultEngHftrModel: Model<AdultEnglishHFTRDocument>,
    
    @InjectModel(AdultFRENCHHFTR.name)
    private readonly adultFrenchHftrModel: Model<AdultFRENCHHFTRDocument>,

    @InjectModel(ChildrenFRENCHHFTR.name)
    private readonly childFrenchHftrModel: Model<ChildrenFRENCHHFTRDocument>,
  ) { }

  async getHftrLessons(filter: HftrFilterDto) {

    const modelMap = {
      [HftrLanguage.ENGLISH]: {
        [HftrType.ADULT]: this.adultEngHftrModel,
        [HftrType.CHILD]: this.childEngHftrModel,
      },
      [HftrLanguage.FRENCH]: {
        [HftrType.ADULT]: this.adultFrenchHftrModel,
        [HftrType.CHILD]: this.childFrenchHftrModel,
      },
    };

    const model: Model<any> = modelMap?.[filter.language]?.[filter.type];

    if (!model) {
      throw new NotFoundException(
        'Requested language/type combination is not available',
      );
    }

    let query: any = {};

    if (filter.lesson) {
      let lessonNumebr = filter.lesson;
      if (filter.language === HftrLanguage.YORUBA) {
        lessonNumebr = YorubaMapper[filter.lesson.toUpperCase()] || filter.lesson;
      }
      query.lesson = { $regex: `^${lessonNumebr}`, $options: 'i' };
    }

    if (filter.date) {
      // Create UTC start and end of day based on the provided date string (e.g. "2026-07-05")
      // Extract just the date part in case it includes time
      const dateStr = filter.date.split('T')[0];
      const startStr = `${dateStr}T00:00:00.000Z`;
      const endStr = `${dateStr}T23:59:59.999Z`;
      
      query.date = { $gte: startStr, $lte: endStr };
    }

    if (!filter.lesson && !filter.date) {
      throw new NotFoundException('Please provide a lesson or a date');
    }

    console.log('HFTR Service query:', JSON.stringify(query));
    // Use .collection.findOne to bypass Mongoose schema casting
    // because the DB actually stores dates as strings but the schema says Date.
    const lesson = await model.collection.findOne(query);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return {
      message: 'lesson retrieved successfully',
      data: lesson,
    };
  }
}
// to fix yoruba matching issue we get all yoruba doc for adult - ask ai to extract all lessons into an object<[string]:[string]> then we use that to map normal one or two to yoruba
