import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LessonDocument = Lesson & Document;

interface QuestionFormat {
  question?: string;
  answer?: string;
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  lessonNumber: number;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop()
  objective?: string;

  @Prop()
  memoryVerse?: string;

  @Prop()
  text?: string;

  @Prop()
  introduction?: string;

  @Prop({ type: [String], default: [] })
  lessonOutline: string[];

  @Prop({ type: [{ question: String, answer: String }], default: [] })
  questions: QuestionFormat[];

  @Prop()
  lifeApplication?: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
