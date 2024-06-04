import EmailService from './email.service';
import PhoneService from './phone.service';

type NotificationType = 'Email' | 'Phone';
interface User {
  name: string;
  email: string;
  phone: string;
  notifycationType: NotificationType;
}

interface Wallet {
  amount: number;
  balance: number;
  userId:number
}
class NotificationService {
  newNotification = async (data: User) => {
    try {
      if (data.notifycationType === 'Email') {
        await new EmailService(data.email, data.name).sendWelcome();
      } else {
        await new PhoneService(data.phone, data.name).sendNewMessage();
      }
    } catch (error) {
      console.log(error);
    }
  };

  creditNotification = async (user: User, wallet: Wallet) => {
    try {
      if (user.notifycationType === 'Email') {
        await new EmailService(user.email, user.name).sendCredit(
          wallet.amount,
          wallet.balance
        );
      } else {
        await new PhoneService(user.phone, user.name).sendCreditMessage();
      }
    } catch (error) {
      console.log(error);
    }
  };

  insufficientNotification = async ( wallet: Wallet) => {
    try {
        console.log( wallet);
        
    //   if (user.notifycationType === 'Email') {
    //     await new EmailService(user.email, user.name).sendInsufficient(
    //       wallet.amount,
    //       wallet.balance
    //     );
    //   } else {
    //     await new PhoneService(
    //       user.phone,
    //       user.name
    //     ).sendInsuffientFundMessage();
    //   }
    } catch (error) {
      console.log(error);
    }
  };
}

export default new NotificationService();
