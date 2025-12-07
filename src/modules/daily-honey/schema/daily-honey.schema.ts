import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyHoneyDocument = DailyHoney & Document;

@Schema({ timestamps: true })
export class DailyHoney {
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

  @Prop({ type: String })
  month: string;

  @Prop({ type: Number })
  year: number;
}

export const DailyHoneySchema = SchemaFactory.createForClass(DailyHoney);
