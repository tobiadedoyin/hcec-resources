import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChildrenFRENCHHFTRDocument = ChildrenFRENCHHFTR & Document;

@Schema({ collection: 'childrenfrenchhftrs', timestamps: true })
export class ChildrenFRENCHHFTR {
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
  focus: string[];

  @Prop({ type: [String], default: [] })
  questions: string[];

  @Prop({ type: [String], default: [] })
  pointForAction?: string[];
}
export const ChildrenFRENCHHFTRSchema =
  SchemaFactory.createForClass(ChildrenFRENCHHFTR);
