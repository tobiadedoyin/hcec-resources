import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentGateway, PaymentStatus } from '../../../enum/payment.enum';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({ type: String })
  paymentMethod: string;

  @Prop({ type: String, required: true })
  transactionRefrence: string;

  @Prop({ type: String, enum: Object.values(PaymentGateway), required: true })
  paymentGateway: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
