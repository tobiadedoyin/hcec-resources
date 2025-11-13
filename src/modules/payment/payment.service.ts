import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Request } from 'express';
import { Model } from 'mongoose';
import { PendingJobType } from 'src/enum/jobs.enum';
import { PaymentGateway, PaymentStatus } from 'src/enum/payment.enum';
import { CreatePendingJob } from '../persist-job-task/dto/create-pending.dto';
import { PersistJobTaskService } from '../persist-job-task/persist-job-task.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FlutterwaveService } from './providerService/flutterwave.service';
import { PaystackService } from './providerService/paystack.service';
import { Transaction, TransactionDocument } from './schema/transaction.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,

    private readonly eventEmitter: EventEmitter2,
    private readonly paystackService: PaystackService,
    private readonly flutterService: FlutterwaveService,
    private readonly persistJobTaskService: PersistJobTaskService,
  ) {}

  async initiatePayment(amount: number, email: string, txRef: string) {
    const providers = [
      // this.flutterService
      //   .initFlutterwavePayment(amount, email, txRef)
      //   .then((res) => ({ paymentGateway: PaymentGateway.FLUTTER, ...res })),
      this.paystackService
        .initPaystackPayment(email, amount)
        .then((res) => ({ paymentGateway: PaymentGateway.PAYSTACK, ...res })),
    ];

    const result = await Promise.any(providers);
    const payment = await this.transactionModel.create({
      amount,
      paymentGateway: result.paymentGateway,
      transactionRefrence: result.reference || txRef,
      paymentStatus: PaymentStatus.PENDING,
    });

    return {
      transactionId: payment.id,
      url: result.authorization_url || result.link,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async updateTransactionDocument(data: UpdateTransactionDto) {
    const transaction = await this.transactionModel.findOneAndUpdate(
      {
        transactionRefrence: data?.transactionRefrence,
      },
      {
        paymentStatus: data?.status,
        paymentMethod: data?.paymentMethod,
      },
      { new: true },
    );

    if (!transaction) throw new NotFoundException('Transaction not found');
  }

  async verifyPayment(
    transactionReference: string,
    transactionId: string = null,
  ) {
    const transaction = await this.transactionModel.findOne({
      transactionRefrence: transactionReference,
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    let verified = false;
    if (transaction.paymentGateway === PaymentGateway.FLUTTER) {
      verified =
        await this.flutterService.verifyFlutterwavePayment(transactionId);
    } else if (transaction.paymentGateway === PaymentGateway.PAYSTACK) {
      verified =
        await this.paystackService.verifyPaystackPayment(transactionReference);
    }

    const paymentStatus = verified
      ? PaymentStatus.SUCCESS
      : PaymentStatus.FAILED;

    //TODO send payment notification email to users
    return {
      message: 'payment verified successfull',
      data: {
        status: paymentStatus,
        amount: transaction.amount,
        reference: transactionReference,
      },
    };
  }

  async handleFlutterwaveWebhook(req: Request) {
    const headerSig = (req.headers['verif-hash'] as string) || '';
    const secretHash = process.env.FLW_SECRET_HASH || '';

    if (!headerSig || headerSig !== secretHash) {
      return false;
    }

    const data: CreatePendingJob = {
      type: PendingJobType.GIVING_STATUS_UPDATE,
      payload: {
        gateway: PaymentGateway.FLUTTER,
        ...req.body,
      },
    };

    await this.persistJobTaskService.createPendingJob(data);

    return true;
  }

  async handlePaystackWebhook(req: Request & { rawBody?: Buffer }) {
    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body));

    const headerSig = req.headers['x-paystack-signature'] as string;
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

    if (!headerSig || !secretKey) return false;

    const expected = crypto
      .createHmac('sha512', secretKey)
      .update(raw)
      .digest('hex');

    if (expected !== headerSig) {
      return false;
    }

    // const data: CreatePendingJob = {
    //   type: PendingJobType.GIVING_STATUS_UPDATE,
    //   payload: {
    //     gateway: PaymentGateway.PAYSTACK,
    //     ...req.body,
    //   },
    // };

    // await this.persistJobTaskService.createPendingJob(data);

    return true;
  }

  async deleteTransaction(transcId: string) {
    const transaction = await this.transactionModel.findByIdAndDelete(transcId);
    if (!transaction) throw new NotFoundException('transaction not found');
    return;
  }
}
