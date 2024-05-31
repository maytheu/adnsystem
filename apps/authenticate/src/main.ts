/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import 'dotenv/config';

import { env } from '@apps/core';
import { AppError, globalErrorHndler } from '@apps/error';
import router from './routes';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/api', router);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(`Ooops.. ${req.originalUrl} not found on this server`, 404)
  );
});

app.use(globalErrorHndler);
const port = env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
