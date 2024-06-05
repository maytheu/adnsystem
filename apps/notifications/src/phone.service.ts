import twilio from 'twilio';
import { secret } from './secret';

class PhoneService {
  private phone: string;
  private name: string;

  constructor(phone: string, name: string) {
    this.phone = phone;
    this.name = name;
  }

  private sendTwilio = (body: string, to: string) => {
    return twilio(
      secret.TWILIO_ACCOUNT_SID,
      secret.TWILIO_AUTH_TOKEN
    ).messages.create({ from: secret.TWILIO_PHONE, to, body });
  };

  private formatPhone = (phone: string) => {
    return phone.replace(/^0/, '+234');
  };

  sendNewMessage = async () => {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
    await this.sendTwilio(text, this.formatPhone(this.phone));
  };

  sendCreditMessage = async (amount: number, balance: number) => {
    const text = `Hi ${this.name}, Your account have been credited with #${amount}, total balance: ${balance}`;
    await this.sendTwilio(text, this.formatPhone(this.phone));
  };

  sendDebitMessage = async (amount: number, balance: number) => {
    const text = `Hi ${this.name}, Your account have been debited with #${amount}, total balance: ${balance}`;
    await this.sendTwilio(text, this.formatPhone(this.phone));
  };

  async sendInsuffientFundMessage(amount: number, balance: number) {
    const text = `Hi ${this.name}, Your account  #${amount}, is not successful, your balance ${balance} is too low`;
    await this.sendTwilio(text, this.formatPhone(this.phone));
  }
}

export default PhoneService;
