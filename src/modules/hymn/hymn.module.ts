import { MongooseModule } from '@nestjs/mongoose';
import { HymnService } from './hymn.service';

import { Module } from '@nestjs/common';
import { EnglishHymn, EnglishHymnSchema } from './schema/english-hymn.schema';
import { YorubaHymn, YorubaHymnSchema } from './schema/yoruba-hymn.schema';
import { HymnsController } from './hymn.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YorubaHymn.name, schema: YorubaHymnSchema },
      { name: EnglishHymn.name, schema: EnglishHymnSchema },
    ]),
  ],
  controllers: [HymnsController],
  providers: [HymnService],
})
export class HymnModule {}
