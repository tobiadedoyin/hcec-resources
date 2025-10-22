import { IsEmail, IsString } from 'class-validator';

export class UserPaymentInfo {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
