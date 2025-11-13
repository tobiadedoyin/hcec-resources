import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Post('verify')
  async verifyPayment(
    @Body() data: { transactionId: string | null, transactionReference: string },
  ) {
    return this.paymentsService.verifyPayment(
      data.transactionReference,
      data.transactionId,
    );
  }

  @Post('flutter/webhook')
  async flutterWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    try {
      const result = await this.paymentsService.handleFlutterwaveWebhook(req);
      if (!result) {
        return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
      }

      return res.status(HttpStatus.OK).send('Webhook received');
    } catch (err) {
      console.error('Flutterwave webhook error:', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server error');
    }
  }

  @Post('paystack/webhook')
  async paystackWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    try {
      const result = await this.paymentsService.handlePaystackWebhook(req);
      if (!result) {
        return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
      }

      return res.status(HttpStatus.OK).send('Webhook received');
    } catch (err) {
      console.error('Paystack webhook error:', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server error');
    }
  }
}
