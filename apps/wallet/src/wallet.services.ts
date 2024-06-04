import { PaymentData, prisma } from '@apps/core';
import {
  NOTIFICATION,
  PAYMENT_CREDIT,
  PAYMENT_DEBIT,
  USER_WALLET,
  channel,
} from '@apps/queue';

class WalletService {
  newWallet = async (userId: number) => {
    try {
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

      return channel.sendToQueue(
        USER_WALLET,
        Buffer.from(JSON.stringify(wallet))
      );
    } catch (error) {
      return error;
    }
  };

  creditWallet = async (data: PaymentData) => {
    try {
      const user = await prisma.wallet.findFirst({
        where: { userId: data.userId },
        select: { id: true },
      });
      const wallet = await prisma.wallet.update({
        where: { id: user.id },
        data: { balance: { increment: +data.amount } },
        select: { balance: true },
      });

      // channel.sendToQueue(PAYMENT_CREDIT, Buffer.from(JSON.stringify(wallet)));

      channel.sendToQueue(
        NOTIFICATION,
        Buffer.from(
          JSON.stringify({
            data: {
              amount: data.amount,
              balance: wallet.balance,
              userId: data.userId,
            },
            notify: 'credit',
          })
        )
      );
    } catch (error) {
      return error;
    }
  };

  debitWallet = async (data: PaymentData) => {
    try {
      const wallet = await prisma.wallet.findFirst({
        where: { userId: data.userId },
        select: { balance: true, id: true },
      });

      if (wallet.balance < data.amount) {
        // use notification service
        channel.sendToQueue(
          NOTIFICATION,
          Buffer.from(
            JSON.stringify({
              data: {
                amount: data.amount,
                balance: wallet.balance,
                userId: data.userId,
              },
              notify: 'insufficient-funds',
            })
          )
        );
        channel.sendToQueue(
          PAYMENT_DEBIT,
          Buffer.from(
            JSON.stringify(
              'An error occured, check your primary notification setting for more details'
            )
          )
        );
      } else {
        const walletUpdate = await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: +data.amount } },
          select: { balance: true },
        });
        channel.sendToQueue(
          PAYMENT_DEBIT,
          Buffer.from(JSON.stringify(walletUpdate))
        );

        channel.sendToQueue(
          NOTIFICATION,
          Buffer.from(
            JSON.stringify({
              data: {
                amount: data.amount,
                balance: wallet.balance,
                userId: data.userId,
              },
              notify: 'debit',
            })
          )
        );
      }
    } catch (error) {
      return error;
    }
  };
}

export default new WalletService();
