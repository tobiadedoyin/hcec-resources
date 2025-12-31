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
  AdultYorubaHFTR,
  AdultYorubaHFTRDocument,
} from './schema/adult-yoruba-hftr.schema';
import {
  ChildrenEnglishHFTR,
  ChildrenEnglishHFTRDocument,
} from './schema/children-english-hftr.schema';

@Injectable()
export class HFTRService {
  constructor(
    @InjectModel(ChildrenEnglishHFTR.name)
    private readonly childEngHftrModel: Model<ChildrenEnglishHFTRDocument>,

    @InjectModel(AdultEnglishHFTR.name)
    private readonly adultEngHftrModel: Model<AdultEnglishHFTRDocument>,

    @InjectModel(AdultYorubaHFTR.name)
    private readonly adultYrbHftrModel: Model<AdultYorubaHFTRDocument>,
  ) {}

  async getHftrLessons(filter: HftrFilterDto) {
    const modelMap = {
      [HftrLanguage.ENGLISH]: {
        [HftrType.ADULT]: this.adultEngHftrModel,
        [HftrType.CHILD]: this.childEngHftrModel,
      },
      [HftrLanguage.YORUBA]: {
        [HftrType.ADULT]: this.adultYrbHftrModel,
      },
    };

    const model: Model<any> = modelMap?.[filter.language]?.[filter.type];

    if (!model) {
      throw new NotFoundException(
        'Requested language/type combination is not available',
      );
    }

    const lessonNumebr =
      filter.language === HftrLanguage.ENGLISH
        ? filter.lesson
        : YorubaMapper[filter.lesson.toUpperCase()];

    const lesson = await model.findOne({
      lesson: { $regex: `^${lessonNumebr}`, $options: 'i' },
    });

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
