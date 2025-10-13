import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HFTRDocument = HFTR & Document;

@Schema({ timestamps: true })
export class HFTR {
  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  lessonNumber: number;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop()
  objective?: string;

  @Prop()
  memoryVerse?: string; //memoryverse Text

  @Prop()
  verses?: string; // exodus 2:10, dainl 3:10, mark 4:16

  @Prop()
  introduction?: string;

  @Prop({ type: [String], default: [] })
  lessonOutline: string[];

  @Prop({ type: [String], default: [] })
  questions: string[];

  @Prop({ type: [String], default: [] })
  lifeApplication?: string[]; // numbered
}

export const HFTRSchema = SchemaFactory.createForClass(HFTR);
