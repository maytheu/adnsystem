import { prisma } from '@apps/core';
import { channel } from '@apps/queue';

class WalletService {
  newWallet = async (userId: number) => {
    try {
      // channel.consume('WALLET', async (data) => {
      //   const userId = JSON.parse(data.content);
      //   await prisma.wallet.create({ data: { userId } });
      //   channel.ack(data);
      // });
       return await prisma.wallet.create({ data: { userId } });
    } catch (error) {
      return error;
    }
  };
}

export default new WalletService();
