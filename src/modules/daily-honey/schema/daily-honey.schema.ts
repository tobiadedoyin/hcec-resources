import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyStudyDocument = DailyStudy & Document;

@Schema({ timestamps: true })
export class DailyStudy {
  @Prop({ required: true })               
  day: string;

  @Prop({ required: true })
  topic: string;

  @Prop()
  scriptureInFocus?: string;

  @Prop()
  learnByHeart?: string;

  @Prop()
  body?: string;

  @Prop()
  challenge?: string;

  @Prop()
  prayer?: string;
}

export const DailyStudySchema = SchemaFactory.createForClass(DailyStudy);
