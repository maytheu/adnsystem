import { prisma } from '@apps/core';
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

  creditWallet = async (data: { userId: number; amount: number }) => {
    try {
      const wallet = await prisma.wallet.update({
        where: { userId: data.userId },
        data: { balance: { increment: +data.amount } },
        select: { balance: true },
      });

      channel.sendToQueue(PAYMENT_CREDIT, Buffer.from(JSON.stringify(wallet)));

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

  debitWallet = async (data: { userId: number; amount: number }) => {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: data.userId },
        select: { balance: true },
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
            'An error occured, check your primary notification setting'
          )
        );
        console.log(wallet, data);
      } else {
        const wallet = await prisma.wallet.update({
          where: { userId: data.userId },
          data: { balance: { decrement: +data.amount } },
          select: { balance: true },
        });

        channel.sendToQueue(PAYMENT_DEBIT, Buffer.from(JSON.stringify(wallet)));

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
