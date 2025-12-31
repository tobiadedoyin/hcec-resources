import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdultEnglishHFTRDocument = AdultEnglishHFTR & Document;

@Schema({ collection: 'adultenglishhftrs', timestamps: true })
export class AdultEnglishHFTR {
  @Prop({ type: String, required: true })
  topic: string;

  @Prop({ type: String, required: true })
  lesson: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String })
  objective?: string;

  @Prop({ type: String })
  memoryVerse?: string;

  @Prop()
  verse?: string; // exodus 2:10, dainl 3:10, mark 4:16

  @Prop()
  introduction?: string;

  @Prop({ type: [String], default: [] })
  questions: string[];

  @Prop({ type: [String], default: [] })
  lifeApplication?: string[];
}
export const AdultEnglishHFTRSchema =
  SchemaFactory.createForClass(AdultEnglishHFTR);
