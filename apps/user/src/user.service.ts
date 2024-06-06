import { prisma } from '@apps/core';
import {
  NOTIFY_USER,
  PAYMENT_CREDIT,
  USER,
  USER_WALLET,
  WALLET,
  mqServer,
} from '@apps/queue';
import { channel } from '@apps/queue';
import { User } from '@prisma/client';

class UserService {
  user = async (userId: number, action = '') => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phone: true,
          notificationType: true,
          name: true,
        },
      });
      // send user to payment service
      if (action === 'payment') {
        channel.sendToQueue(PAYMENT_CREDIT, Buffer.from(JSON.stringify(user)));
      } else if (action === 'notification') {        
        channel.sendToQueue(NOTIFY_USER, Buffer.from(JSON.stringify(user)));
      }
      return user;
    } catch (error) {
      return error;
    }
  };

  profile = async (userId: number) => {
    try {
      const user = await this.user(userId);
      if (user instanceof Error) return user;

      // Make request from wallet service for user wallet info
      channel.sendToQueue(
        WALLET,
        Buffer.from(JSON.stringify({ userId, task: 'getWallet' }))
      );

      // Receive the user wallet info from wallet service
      return new Promise((resolve, reject) => {
        const onMessage = (data) => {
          if (data !== null) {
            channel.ack(data);
            try {
              const wallet = JSON.parse(data.content.toString());
              resolve({ user, wallet });
            } catch (error) {
              reject(new Error('Failed to parse wallet data'));
            } finally {
              channel.cancel(consumerTag, (err) => {
                if (err) {
                  console.error('Failed to cancel consumer', err);
                }
              });
            }
          } else {
            reject(new Error('Received null data'));
          }
        };

        const consumerTag = `consumer_${userId}_${Date.now()}`;

        mqServer(USER_WALLET).then(() => {
          channel.consume(
            USER_WALLET,
            onMessage,
            { noAck: false, consumerTag },
            (err) => {
              if (err) {
                console.error('Failed to start consumer', err);
                reject(err);
              }
            }
          );
        });
      });
    } catch (error) {
      return error;
    }
  };

  updateProfile = async (data: User) => {
    try {
      return await prisma.user.update({
        where: { id: data.id },
        data: { ...data },
      });
    } catch (error) {
      return error;
    }
  };
}

export default new UserService();
