import { PartialType } from '@nestjs/mapped-types';
import { CreateHymnDto } from './create-hymn.dto';

export class UpdateHymnDto extends PartialType(CreateHymnDto) {}
