import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HymnLanguage } from '../../../enum/hymn.enum';

@Schema({ _id: false })
export class Verse {
  @Prop({ type: Number, required: true })
  number: number;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Number, default: 1 })
  stanza?: number;
}
export const VerseSchema = SchemaFactory.createForClass(Verse);

@Schema({ timestamps: true })
export class YorubaHymn {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true, unique: true })
  number: number;

  @Prop({ type: String })
  tune: string;

  @Prop({ type: String, default: HymnLanguage.YORUBA })
  language: string;

  @Prop({ type: String })
  author?: string;

  @Prop({ type: String })
  bibleVerse?: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: [VerseSchema], default: [] })
  verses: Verse[];
}
export const YorubaHymnSchema = SchemaFactory.createForClass(YorubaHymn);

export type YorubaHymnDocument = YorubaHymn & Document;
