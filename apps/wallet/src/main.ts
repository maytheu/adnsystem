/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import 'dotenv/config';
import { env } from '@apps/core';
import { AppError, globalErrorHndler } from '@apps/error';
import amqp from 'amqplib';

import router from './routes';
import WalletService from './services';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json());

export let channel, connection;
async function rabbitQue() {
  const amqpServer = 'amqp://localhost:5672';
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue('WALLET');
}

rabbitQue().then(() => {
  channel.consume('WALLET', async (data) => {
    const userId = JSON.parse(data.content);
    const newWallet = await WalletService.newWallet(+userId);
    if (newWallet instanceof Error) {
    } else {
      channel.ack(data);
    }
  });
});

app.use('/api/wallet', router);
app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(`Ooops.. ${req.originalUrl} not found on this server`, 404)
  );
});

app.use(globalErrorHndler);

const port = env.PORT || 5004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
