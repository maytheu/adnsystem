import { cleanEnv, email, num, str } from 'envalid';

export const secret = cleanEnv(process.env, {
  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE: str(),
  EMAIL_HOST: str(),
  EMAIL_PORT: num(),
  EMAIL_USER: str(),
  EMAIL_PASSWORD: str(),
  EMAIL_SENDER: email({ default: 'test@gmail.com' }),
});
