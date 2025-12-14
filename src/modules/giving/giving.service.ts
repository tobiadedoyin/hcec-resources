import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentStatus } from 'src/enum/payment.enum';
import { generateTrxReference } from 'src/helper/transaction-reference-creator.utils';
import { PaymentService } from '../payment/payment.service';
import { Transaction } from '../payment/schema/transaction.schema';
import { CreateGivingDto } from './dto/create-giving.dto';
import { ContributionLinkDto } from './dto/save-contribution-link.dto';
import {
  ContributionLink,
  ContributionLinkDocument,
} from './schema/contribution-link.schema';
import { Giving, GivingDocument } from './schema/giving.schema';

@Injectable()
export class GivingService {
  constructor(
    @InjectModel(Giving.name)
    private readonly givingModel: Model<GivingDocument>,

    @InjectModel(ContributionLink.name)
    private readonly contributionLinkModel: Model<ContributionLinkDocument>,

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

  // async getOrphanedPayments() {
  //   const oneDayAgo = new Date();
  //   oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  //   const allExpired = await this.givingModel
  //     .find({ expiresAt: { $lt: oneDayAgo } })
  //     .populate('transaction');

  //   const orphanedPayment = allExpired.filter(
  //     (p) =>
  //       (p.transaction as Transaction).paymentStatus === PaymentStatus.PENDING,
  //   );

  //   return orphanedPayment;
  // }

  async deleteGiving(
    givingId: string,
    transactionId?: string | null,
  ): Promise<void> {
    await this.givingModel.findByIdAndDelete(givingId);

    if (transactionId) {
      await this.paymentService.deleteTransaction(transactionId);
    }
  }

  async makePayment(data: CreateGivingDto) {
    const givenData = await this.givingModel.create(data);

    const trxNumber = generateTrxReference();

    const response = await this.paymentService.initiatePayment(
      data.amount,
      data.email,
      trxNumber,
    );

    if (!response || !response?.url) {
      throw new InternalServerErrorException('Failed to initiate payment');
    }

    await this.attachTransactionId(givenData.id, response.transactionId);

    givenData.expiresAt = response.expiresAt;

    await givenData.save();

    return {
      message: 'Payment url generated succefully',
      data: { url: response.url },
    };
  }

  async saveContributionLink(data: ContributionLinkDto) {
    const link = await this.contributionLinkModel.create(data);

    return {
      message: 'Contribution link saved successfully',
      data: link,
    };
  }

  async getContributionLink() {
    const links = await this.contributionLinkModel.find();

    return {
      message: 'Contribution link retrieved successfully',
      data: links,
    };
  }

  async deleteContributionLink(id: string) {
    const deleted = await this.contributionLinkModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('Contribution link not found');
    }

    return {
      message: 'Contribution link deleted successfully',
    };
  }
}
