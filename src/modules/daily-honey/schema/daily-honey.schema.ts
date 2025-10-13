import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyHoneyDocument = DailyHoney & Document;

@Schema({ timestamps: true })
export class DailyHoney {
  @Prop({ required: true })               
  day: number;

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

export const DailyHoneySchema = SchemaFactory.createForClass(DailyHoney);
