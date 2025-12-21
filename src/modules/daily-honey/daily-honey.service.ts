import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isFutureDate } from '../../helper/future-time-checker';
import { DailyHoneyQuery } from './dto/get-daily-honey-query.dto';
import { DailyHoney, DailyHoneyDocument } from './schema/daily-honey.schema';

@Injectable()
export class DailyHoneyService {
  constructor(
    @InjectModel(DailyHoney.name)
    private readonly dailyHoneyModel: Model<DailyHoneyDocument>,
  ) {}

  async getDailyHoney(query: DailyHoneyQuery) {
    console.log(">>>>>>>>>>> 1", query)
    let lesson: DailyHoney;
    const hasQuery = !!query && Object.keys(query).length > 0;

    if (hasQuery) {
      const isFuture = isFutureDate(query);
      if (isFuture)
        throw new ForbiddenException('Lesson not available at the moment');

      const data = await this.dailyHoneyModel.findOne(query);

      console.log(">>>>>>>>>>>>> 2", data)
      if (!data) throw new NotFoundException('Lesson not found');

      lesson = data;
    } else {
      const date = new Date();

      const data = await this.dailyHoneyModel.findOne({
        day: date.getDate(),
        month: String(date.getMonth() + 1),
        year: date.getFullYear(),
      });

      if (!data) throw new NotFoundException('Lesson not found');

      lesson = data;
    }

    return {
      message: 'lesson retrieved successfully',
      data: lesson,
    };
  }
}
