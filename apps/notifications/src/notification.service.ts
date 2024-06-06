import { NOTIFY_USER, USER, channel, mqServer } from '@apps/queue';
import EmailService from './email.service';
import PhoneService from './phone.service';
import { Notify, User } from '@apps/core';

class NotificationService {
  newNotification = async (data: User) => {
    try {      
      await new EmailService(data.email, data.name).sendWelcome();
      await new PhoneService(data.phone, data.name).sendNewMessage();
    } catch (error) {
      console.log(error);
    }
  };

  sendNotification = async (data: Notify, action: string) => {
    try {
      channel.sendToQueue(
        USER,
        Buffer.from(
          JSON.stringify({ userId: data.userId, action: 'notification' })
        )
      );

      return new Promise((resolve, reject) => {
        const onMessage = async(el) => {
          if (el !== null) {
            channel.ack(el);
            try {
              const user:User = JSON.parse(el.content);              
              // send notification based on user preference
              if (user.notificationType === 'Email') {
                if (action === 'credit')
                  await new EmailService(user.email, user.name).sendCredit(
                    data.amount,
                    data.balance
                  );
                else if (action === 'debit')
                  await new EmailService(user.email, user.name).sendDebit(
                    data.amount,
                    data.balance
                  );
                else
                  await new EmailService(
                    user.email,
                    user.name
                  ).sendInsufficient(data.amount, data.balance);
              } else {
                // phone verification
                console.log(user, action, 'phone');                
                if (action === 'credit')
                  await new PhoneService(
                    user.phone,
                    user.name
                  ).sendCreditMessage(data.amount, data.balance);
                else if (action === 'debit')
                  await new PhoneService(
                    user.phone,
                    user.name
                  ).sendDebitMessage(data.amount, data.balance);
                else {
                  await new PhoneService(
                    user.phone,
                    user.name
                  ).sendInsuffientFundMessage(data.amount, data.balance);
                }
              }
              resolve({ user });
            } catch (error) {
              console.log(error);
              reject(new Error('Failed to parse notification'));
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

        const consumerTag = `user-consumer_${data.userId}_${Date.now()}`;

        mqServer(NOTIFY_USER).then(() => {
          channel.consume(
            NOTIFY_USER,
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
      console.log(error);
    }
  };
}

export default new NotificationService();
