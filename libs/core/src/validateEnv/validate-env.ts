import { cleanEnv, num, str } from 'envalid';

export const env = cleanEnv(process.env, {
  SECRET_KEY: str(),
});
