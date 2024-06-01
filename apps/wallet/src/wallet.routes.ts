import { Router } from 'express';
import { isAuthenticated } from '@apps/core';
import { WALLET, channel, mqServer } from '@apps/queue';

import WalletService from './wallet.services';

const router = Router();

mqServer(WALLET).then(() => {
  channel.consume(WALLET, async (data) => {
    const walletData = JSON.parse(data.content);
    if (walletData?.task) {
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
    } else {
      await WalletService.updateWallet(walletData.user, walletData.operator);
    }
  });
});

router.get('/credit', isAuthenticated);
// router.post('/signup', Authcontroller.signup)

export default router;
