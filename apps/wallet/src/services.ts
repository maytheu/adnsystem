import { prisma } from '@apps/core';
import { USER, channel } from '@apps/queue';

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

  wallet = async (userId: number) => {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      });

      channel.sendToQueue(USER, Buffer.from(JSON.stringify(wallet)));
    } catch (error) {
      return error;
    }
  };
}

export default new WalletService();
