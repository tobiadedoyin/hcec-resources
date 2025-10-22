import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [GivingController, ],
    providers: [GivingService],
})
export class GivingModule {}
