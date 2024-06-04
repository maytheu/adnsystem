import { cleanEnv, num } from 'envalid';

export const secret = cleanEnv(process.env, {
  PORT: num({ default: 5004 }),
});
