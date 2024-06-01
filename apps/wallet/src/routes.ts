import { Router } from 'express';
import { isAuthenticated } from '@apps/core';
import { WALLET, channel, mqServer } from '@apps/queue';

import WalletService from './services';

const router = Router();

mqServer(WALLET).then(() => {
  channel.consume('WALLET', async (data) => {
    const userId = JSON.parse(data.content);
    const newWallet = await WalletService.newWallet(+userId);
    if (newWallet instanceof Error) {
    } else {
      channel.ack(data);
    }
  });
});

router.get('/credit', isAuthenticated);
// router.post('/signup', Authcontroller.signup)

export default router;
