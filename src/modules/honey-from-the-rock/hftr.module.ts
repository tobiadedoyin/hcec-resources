import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HFTRController } from './hftr.controller';
import { HFTRService } from './hftr.service';
import {
  AdultEnglishHFTR,
  AdultEnglishHFTRSchema,
} from './schema/adult-english-hftr.schema';
import {
  AdultYorubaHFTR,
  AdultYorubaHFTRSchema,
} from './schema/adult-yoruba-hftr.schema';
import {
  ChildrenEnglishHFTR,
  ChildrenEnglishHFTRSchema,
} from './schema/children-english-hftr.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChildrenEnglishHFTR.name, schema: ChildrenEnglishHFTRSchema },
      { name: AdultYorubaHFTR.name, schema: AdultYorubaHFTRSchema },
      { name: AdultEnglishHFTR.name, schema: AdultEnglishHFTRSchema },
    ]),
  ],
  controllers: [HFTRController],
  providers: [HFTRService],
})
export class HFTRModule {}
