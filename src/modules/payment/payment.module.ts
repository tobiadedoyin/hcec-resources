import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { PersistJobTaskModule } from '../persist-job-task/persist-job-task.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { FlutterwaveService } from './providerService/flutterwave.service';
import { PaystackService } from './providerService/paystack.service';
import { Transaction, TransactionSchema } from './schema/transaction.schema';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PersistJobTaskModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, FlutterwaveService, PaystackService],
  exports: [PaymentService],
})
export class PaymentModule {}
