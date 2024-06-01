import { prisma } from '@apps/core';

class WalletService {
  newWallet = async (userId: number) => {
    try {
     return await prisma.wallet.create({ data: { userId } });
    } catch (error) {
      return error;
    }
  };
}

export default new WalletService()