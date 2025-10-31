import { MongooseModule } from '@nestjs/mongoose';
import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';

import { Module } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { Giving, GivingSchema } from './schema/giving.schema';

@Module({
  imports: [
    PaymentModule,
    MongooseModule.forFeature([{ name: Giving.name, schema: GivingSchema }]),
  ],
  controllers: [GivingController],
  providers: [GivingService],
  exports: [GivingService],
})
export class GivingModule {}
