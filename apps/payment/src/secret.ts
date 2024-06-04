import { cleanEnv, num, str } from 'envalid';

export const secret = cleanEnv(process.env, {
  PORT: num({ default: 5002 }),
  PAYSTACK_SECRET: str(),
});
