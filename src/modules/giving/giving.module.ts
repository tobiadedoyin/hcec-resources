import { MongooseModule } from '@nestjs/mongoose';
import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';

import { Module } from '@nestjs/common';
import { Giving, GivingSchema } from './schema/giving.schema';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    PaymentModule,
    MongooseModule.forFeature([{ name: Giving.name, schema: GivingSchema }]),
  ],
  controllers: [GivingController],
  providers: [GivingService],
})
export class GivingModule {}
