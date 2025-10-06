import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HymnsController } from './hymn.controller';
import { HymnsService } from './hymn.service';
import { Hymn, HymnSchema } from '../../schema/hymn.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hymn.name, schema: HymnSchema }]),
  ],
  controllers: [HymnsController],
  providers: [HymnsService],
})
export class HymnModule {}
