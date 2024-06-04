/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import 'dotenv/config';
import { AppError, globalErrorHndler } from '@apps/error';
import { channel, WALLET, mqServer } from '@apps/queue';

import { secret } from './secret';
import WalletService from './wallet.services';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json());

mqServer(WALLET).then(() => {
  channel.consume(WALLET, async (data) => {
    const walletData = JSON.parse(data.content);
    if (walletData?.task) {
      if (walletData.task === 'newWallet') {
        const newWallet = await WalletService.newWallet(+walletData.userId);

        channel.ack(data);
      }
      if (walletData.task === 'getWallet') {
        await WalletService.wallet(+walletData.userId);
        channel.ack(data);
      }
    } else {
      await WalletService.creditWallet(walletData.user);
    }
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(`Ooops.. ${req.originalUrl} not found on this server`, 404)
  );
});

app.use(globalErrorHndler);

const port = secret.PORT || 5004;
const server = app.listen(port, () => {
  console.log(`Wallet service on port: ${port}`);
});
server.on('error', console.error);
