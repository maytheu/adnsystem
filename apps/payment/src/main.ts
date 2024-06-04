/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import { AppError, globalErrorHndler } from '@apps/error';

import router from './payment.routes';
import { secret } from './secret';

dotenv.config({ path: path.resolve('../.env') });
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json());

app.use('/api/payment', router);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(`Ooops.. ${req.originalUrl} not found on this server`, 404)
  );
});

app.use(globalErrorHndler);
const port = secret.PORT || 5002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api/payment`);
});
server.on('error', console.error);
