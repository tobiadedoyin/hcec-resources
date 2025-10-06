import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hymn, HymnDocument } from '../../schema/hymn.schema';

@Injectable()
export class HymnsService {
  constructor(@InjectModel(Hymn.name) private hymnModel: Model<HymnDocument>) {}

  async createHymn(data: Partial<Hymn>): Promise<Hymn> {
    const newHymn = new this.hymnModel(data);
    return newHymn.save();
  }

  async findAll(): Promise<Hymn[]> {
    return this.hymnModel.find().exec();
  }

  async findByNumberOrTitle(
    query: string,
  ): Promise<{ exactMatch?: Hymn; suggestions?: Hymn[]; notFound?: string }> {
    const isNumber = !isNaN(Number(query)); // Check i

    if (isNumber) {
      // Search by hymn number
      const hymn = await this.hymnModel
        .findOne({ number: Number(query) })
        .exec();
      return hymn ? { exactMatch: hymn } : { notFound: 'not found' };
    } else {
      // Search for an exact title match
      const exactMatch = await this.hymnModel.findOne({ title: query }).exec();
      if (exactMatch) return { exactMatch };

      // If no exact match, return suggestions
      const suggestions = await this.hymnModel
        .find({ title: { $regex: query, $options: 'i' } }) // Case-insensitive search
        .limit(10)
        .exec();

      return { suggestions };
    }
  }
}
