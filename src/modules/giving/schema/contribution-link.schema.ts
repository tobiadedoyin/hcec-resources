import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContributionLinkDocument = ContributionLink & Document;

@Schema({ timestamps: true })
export class ContributionLink {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, require: true })
  paymentLink: string;

  @Prop({ type: String })
  priceGoal: number;
}

export const ContributionLinkSchema =
  SchemaFactory.createForClass(ContributionLink);
