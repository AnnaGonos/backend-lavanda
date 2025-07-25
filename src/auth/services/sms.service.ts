import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { UserService } from '../../user/user.service';

@Injectable()
export class SmsService {
  private client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

}
