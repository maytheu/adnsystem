import { cleanEnv, num, str } from 'envalid';

export const secret = cleanEnv(process.env, {
  PORT: num({ default: 5000 }),
  SECRET_KEY: str(),
});
