import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HFTRController } from './hftr.controller';
import { HFTRService } from './hftr.service';
import {
  AdultEnglishHFTR,
  AdultEnglishHFTRSchema,
} from './schema/adult-english-hftr.schema';
import {
  AdultFRENCHHFTR,
  AdultFRENCHHFTRSchema,
} from './schema/adult-french-hftr.schema';
import {
  ChildrenEnglishHFTR,
  ChildrenEnglishHFTRSchema,
} from './schema/children-english-hftr.schema';
import {
  ChildrenFRENCHHFTR,
  ChildrenFRENCHHFTRSchema,
} from './schema/children-french-hftr.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChildrenEnglishHFTR.name, schema: ChildrenEnglishHFTRSchema },
      { name: ChildrenFRENCHHFTR.name, schema: ChildrenFRENCHHFTRSchema },
      { name: AdultFRENCHHFTR.name, schema: AdultFRENCHHFTRSchema },
      { name: AdultEnglishHFTR.name, schema: AdultEnglishHFTRSchema },
    ]),
  ],
  controllers: [HFTRController],
  providers: [HFTRService],
})
export class HFTRModule {}
