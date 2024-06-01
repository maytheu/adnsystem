import { Router } from 'express';
import { isAuthenticated } from '@apps/core';
import { WALLET, channel, mqServer } from '@apps/queue';

import WalletService from './services';

const router = Router();

mqServer(WALLET).then(() => {
  channel.consume(WALLET, async (data) => {
    const walletData: { userId: string; task: string } = JSON.parse(
      data.content
    );
    if (walletData.task === 'newWallet') {
      const newWallet = await WalletService.newWallet(+walletData.userId);
      if (newWallet instanceof Error) {
      } else {
        channel.ack(data);
      }
    }
    if (walletData.task === 'getWallet') {
      await WalletService.wallet(+walletData.userId);
      channel.ack(data);
    }
  });
});

router.get('/credit', isAuthenticated);
// router.post('/signup', Authcontroller.signup)

export default router;
