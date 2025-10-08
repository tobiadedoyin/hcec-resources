import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { type, data } = metadata;

    // Only target route params named 'id' or ending with 'Id'
    if (
      type === 'param' &&
      typeof value === 'string' &&
      /id$/i.test(data || '')
    ) {
      if (!isValidObjectId(value)) {
        throw new BadRequestException(`Invalid ObjectId format "${data}"`);
      }
    }

    return value;
  }
}
