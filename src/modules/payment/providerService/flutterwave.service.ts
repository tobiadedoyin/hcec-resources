import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class FlutterwaveService {
  constructor(private readonly config: ConfigService) {}

  private getRedirectUrl(): string {
    const envRedirect = this.config.get<string>('FLW_REDIRECT_URL');
    if (envRedirect) return envRedirect;

    return this.config.get<string>('NODE_ENV') === 'production'
      ? 'https://nexgad-frontend.onrender.com/payment-clearance'
      : 'http://localhost:3000/payment-clearance';
  }
  
  async initFlutterwavePayment(amount: number, email: string, txRef: string) {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: txRef,
        amount,
        currency: 'NGN',
        redirect_url: this.getRedirectUrl(),
        customer: {
          email,
        },
        expiry_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.data;
  }

  async verifyFlutterwavePayment(transactionId: string) {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        },
      );

      return response.data.data.status === 'successful';
    } catch (error) {
      console.error(
        'Flutterwave verification error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Invalid Flutterwave transaction ID');
    }
  }
}
