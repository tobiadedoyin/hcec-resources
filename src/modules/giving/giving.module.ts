import { MongooseModule } from '@nestjs/mongoose';
import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';

import { Module } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import {
  ContributionLink,
  ContributionLinkSchema,
} from './schema/contribution-link.schema';
import { Giving, GivingSchema } from './schema/giving.schema';

@Module({
  imports: [
    PaymentModule,
    MongooseModule.forFeature([
      { name: Giving.name, schema: GivingSchema },
      { name: ContributionLink.name, schema: ContributionLinkSchema },
    ]),
  ],
  controllers: [GivingController],
  providers: [GivingService],
  exports: [GivingService],
})
export class GivingModule {}
