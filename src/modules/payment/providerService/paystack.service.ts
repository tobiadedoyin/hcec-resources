import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PaystackService {
  constructor(private readonly config: ConfigService) {}

  private getRedirectUrl(): string {
    const envRedirect = this.config.get<string>('PYS_REDIRECT_URL');
    if (envRedirect) return envRedirect;

    return this.config.get<string>('NODE_ENV') === 'production'
      ? 'https://nexgad-frontend.onrender.com/payment-clearance'
      : 'http://localhost:5173/payment-clearance';
  }

  async initPaystackPayment(email: string, amount: number) {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        callback_url: this.getRedirectUrl(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    return response.data.data;
  }

  async verifyPaystackPayment(reference: string) {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    return response.data.data.status === 'success';
  }
}
