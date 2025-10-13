import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyHoneyQuery } from './dto/get-daily-honey-query.dto';
import { DailyHoney, DailyHoneyDocument } from './schema/daily-honey.schema';

@Injectable()
export class DailyHoneyService {
  constructor(
    @InjectModel(DailyHoney.name)
    private readonly dailyHoneyModel: Model<DailyHoneyDocument>,
  ) {}

//   async getDailyHoney(data: DailyHoneyQuery) {
//       const query: any = {};

//       if(data.day)
//   }
}
