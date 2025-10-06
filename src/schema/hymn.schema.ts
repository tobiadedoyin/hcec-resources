import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HymnDocument = Hymn & Document;

@Schema({ timestamps: true })
export class Hymn {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  number: number; // Hymn number

  @Prop()
  tune?: string; // Melody or tune name

  @Prop({ type: [String], default: [], name: 'bible_reference' })
  bibleReferences?: string[]; // Related Bible verses

  @Prop({ type: [String], required: true })
  verses: string[]; // Array of hymn verses

  @Prop({ required: false })
  chorus?: string; // Optional chorus field

  @Prop({ required: true })
  category: string; // e.g., Worship, Thanksgiving, Praise

  @Prop({ required: false })
  author?: string; // Optional field

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const HymnSchema = SchemaFactory.createForClass(Hymn);
