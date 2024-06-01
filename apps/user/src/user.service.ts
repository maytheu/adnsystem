import { prisma } from '@apps/core';
import { PAYMENT, USER, WALLET } from '@apps/queue';
import { channel } from '@apps/queue';
import { User } from '@prisma/client';

class UserService {
  user = async (userId: number, isMq = false) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true, notificationType: true },
      });
      // send user to payment service
      if (isMq) {
        channel.sendToQueue(PAYMENT, Buffer.from(JSON.stringify(user)));
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

      // make request from wallet service for user wallet info
      channel.sendToQueue(
        WALLET,
        Buffer.from(JSON.stringify({ userId, task: 'getWallet' }))
      );

      //receive the user wallet info from wallet service
      return new Promise((resolve, reject) => {
        // Create a unique consumer tag for this specific request
        const consumerTag = `data_${userId}_${Date.now()}`;
        const onMessage = (data) => {
          if (data !== null) {
            channel.ack(data);
            resolve({ user, wallet: JSON.parse(data.content.toString()) });
            // Cancel the consumer after processing the message
            channel.cancel(consumerTag, (err, ok) => {
              if (err) {
                reject(err);
              }
            });
          }
        };

        // Consume a single message with an exclusive consumer
        channel.consume(
          USER,
          onMessage,
          { noAck: false, consumerTag, exclusive: true },
          (err) => {
            if (err) {
              reject(err);
            }
          }
        );
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
