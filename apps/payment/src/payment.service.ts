import { PaymentData, prisma } from '@apps/core';
import { AppError } from '@apps/error';
import {
  channel,
  mqServer,
  NOTIFICATION,
  PAYMENT_CREDIT,
  PAYMENT_DEBIT,
  USER,
  WALLET,
} from '@apps/queue';
import axios from 'axios';
import { secret } from './secret';

class PaymentService {
  private headers = {
    Authorization: `Bearer ${secret.PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  };

  credit = async (data: PaymentData) => {
    try {
      await mqServer(PAYMENT_CREDIT);
      channel.sendToQueue(
        USER,
        Buffer.from(JSON.stringify({ userId: data.userId, action: 'payment' }))
      );
      const result = await new Promise((resolve, reject) => {
        const consumerTag = `consumer_${data.userId}_${Date.now()}`;

        channel.consume(
          PAYMENT_CREDIT,
          async (userData) => {
            if (userData !== null) {
              const user = JSON.parse(userData.content.toString());

              try {
                const paystackUrl =
                  'https://api.paystack.co/transaction/initialize';
                const response = await axios.post(
                  paystackUrl,
                  { email: user.email, amount: data.amount * 100 },
                  {
                    headers: this.headers,
                  }
                );

                const authorization_url = response.data.data.authorization_url;
                const reference = response.data.data.reference;

                await prisma.payReference.create({
                  data: {
                    reference,
                    userId: +data.userId,
                    amount: data.amount,
                  },
                });

                channel.ack(userData);
                resolve({ authorization_url, reference });

                channel.cancel(consumerTag, (err, ok) => {
                  if (err) {
                    console.error('Error canceling consumer:', err);
                  }
                });
              } catch (error) {
                channel.ack(userData); // Ensure the message is acknowledged to avoid re-delivery
                reject(error);

                channel.cancel(consumerTag, (err, ok) => {
                  if (err) {
                    console.error('Error canceling consumer:', err);
                  }
                });
              }
            }
          },
          { noAck: false, consumerTag, exclusive: true }
        );
      });

      return result;
    } catch (error) {
      return error;
    }
  };

  debit = async (data: PaymentData) => {
    try {
      await mqServer(PAYMENT_DEBIT);
      channel.sendToQueue(
        WALLET,
        Buffer.from(JSON.stringify({ data, task: 'debitWallet' }))
      );

      //receive the user wallet info from wallet service
      return new Promise((resolve, reject) => {
        // Create a unique consumer tag for this specific request
        const consumerTag = `data_${data.userId}_${Date.now()}`;
        const onMessage = (data) => {
          if (data !== null) {
            channel.ack(data);
            resolve({ wallet: JSON.parse(data.content) });
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
          PAYMENT_DEBIT,
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

  verify = async (reference: string) => {
    try {
      const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;

      // Create Paystack transaction
      const response = await axios.get(paystackUrl, { headers: this.headers });
      const { status } = response.data.data;
      if (!status) {
        return new AppError('Payment not confirm', 409);
      }
      this.verifyPayment(reference);
    } catch (error) {
      return error;
    }
  };

  webhook = async (data) => {
    if (data.event === 'charge.success')
      return this.verifyPayment(data.data.reference);
    return new AppError('Payment not confirm', 409);
  };

  private verifyPayment = async (reference: string) => {
    try {
      await mqServer(PAYMENT_CREDIT);
      const user = await prisma.payReference.findFirst({
        where: { reference, completed: false },
        select: { userId: true, amount: true, id: true },
      });
      if (user) {
        channel.sendToQueue(
          WALLET,
          Buffer.from(
            JSON.stringify({
              data: { userId: user.userId, amount: user.amount },
              task: 'creditWallet',
            })
          )
        );
        await prisma.payReference.update({
          where: { id: user.id },
          data: { completed: true },
        });
      }
      return user;
    } catch (error) {}
  };
}

export default new PaymentService();
