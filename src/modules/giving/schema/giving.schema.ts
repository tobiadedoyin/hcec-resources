import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GivingDocument = Giving & Document;

@Schema({ timestamps: true })
export class Giving {
  @Prop({ required: false })
  paymentCode?: string;

  @Prop({ required: false })
  paymentType?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false, default: 'church@gmal.com' })
  email?: string;

  @Prop({ required: false })
  sex?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  currency?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: false })
  transaction?: Types.ObjectId | string;
}

export const GivingSchema = SchemaFactory.createForClass(Giving);
 