import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | string[] | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message ?? message;
        error = (response as any).error ?? null;
      }
    } else {
      this.logger.error(
        `Unexpected error occurred at ${req.method} ${req.url}`,
        (exception as any)?.stack || JSON.stringify(exception),
      );
    }

    res.status(status).json({
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
