import { env, prisma } from '@apps/core';
import { AppError } from '@apps/error';
import { channel, PAYMENT, USER, WALLET } from '@apps/queue';
import axios from 'axios';

interface PaymentData {
  amount: number;
  userId: number;
}

class PaymentService {
  private headers = {
    Authorization: `Bearer ${env.PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  };

  credit = async (data: PaymentData) => {
    try {
      // get user email from user service
      channel.sendToQueue(USER, Buffer.from(JSON.stringify(data.userId)));
      // consume the user details
      const result = await new Promise((resolve, reject) => {
        // Create a unique consumer tag for this specific request
        const consumerTag = `consumer_${data.userId}_${Date.now()}`;

        channel.consume(
          PAYMENT,
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
                resolve(authorization_url);

                // Cancel the consumer after processing the message
                channel.cancel(consumerTag, (err, ok) => {
                  if (err) {
                    console.error('Error canceling consumer:', err);
                  }
                });
              } catch (error) {
                channel.ack(userData); // Ensure the message is acknowledged to avoid re-delivery
                reject(error);

                // Cancel the consumer in case of error
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

  verify = async (reference: string) => {
    const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;

    // Create Paystack transaction
    const response = await axios.get(paystackUrl, { headers: this.headers });
    const { status } = response.data.data;
    if (!status) return new AppError('Payment not confirm', 409);
    this.verifyPayment(reference);
  };

  webhook = async (data) => {
    if (data.event === 'charge.success')
      return this.verifyPayment(data.data.reference);
    return new AppError('Payment not confirm', 409);
  };

  private verifyPayment = async (reference: string) => {
    const user = await prisma.payReference.findFirst({
      where: { reference, completed: false },
      select: { userId: true, amount: true },
    });

    channel.sendToQueue(
      WALLET,
      Buffer.from(JSON.stringify({ user, operator: '+' }))
    );
  };
}

export default new PaymentService();
