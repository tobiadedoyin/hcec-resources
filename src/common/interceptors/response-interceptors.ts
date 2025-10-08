import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((original) => {
        const baseResponse = {
          statusCode,
          success: true,
          timestamp: new Date().toISOString(),
        };

        if (
          original &&
          typeof original === 'object' &&
          'data' in original &&
          'message' in original
        ) {
          return {
            ...baseResponse,
            message: original.message,
            data: original.data,
          };
        }

        return {
          ...baseResponse,
          message: 'Request successful',
          data: original,
        };
      }),
    );
  }
}
