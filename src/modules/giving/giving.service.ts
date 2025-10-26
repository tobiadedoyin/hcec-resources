import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateTrxReference } from 'src/helper/transaction-reference-creator.utils';
import { PaymentService } from '../payment/payment.service';
import { CreateGivingDto } from './dto/create-giving.dto';
import { Giving, GivingDocument } from './schema/giving.schema';

@Injectable()
export class GivingService {
  constructor(
    @InjectModel(Giving.name)
    private readonly givingModel: Model<GivingDocument>,

    private readonly paymentService: PaymentService,
  ) {}

  async attachTransactionId(paymentId: string, transactionId: string) {
    const updatedGivendetail = await this.givingModel.findByIdAndUpdate(
      paymentId,
      { transaction: transactionId },
      { new: true },
    );

    return updatedGivendetail;
  }

  async makePayment(data: CreateGivingDto) {
    const givenData = await this.givingModel.create(data);
console.log("data", data)
    const trxNumber = generateTrxReference();

    const response = await this.paymentService.initiatePayment(
      data.amount,
      data.email,
      trxNumber,
    );

    if (!response || !response?.url) {
      throw new InternalServerErrorException('Failed to initiate payment');
    }
    console.log("response from givingservice", response)
    await this.attachTransactionId(givenData.id, response.transactionId);

    return {
      message: 'Payment url generated succefully',
      data: { url: response.url },
    };
  }
}
