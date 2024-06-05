import path from 'path';
import nodemailer from 'nodemailer';
import { htmlToText } from 'html-to-text';
import ejs from 'ejs';

import { secret } from './secret';

class EmailService {
  private name: string;
  private to: string;
  private from: string;
  private maxTries: number;

  constructor(to: string, name: string) {
    this.to = to;
    this.name = name;
    this.from = `no-reply ${secret.EMAIL_SENDER}`;
    this.maxTries = 5;
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: secret.EMAIL_HOST,
      port: secret.EMAIL_PORT,
      secure: true,
      auth: {
        user: secret.EMAIL_USER,
        pass: secret.EMAIL_PASSWORD,
      },
    });
  }

  private async send(subject: string, html: string) {
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    try {
      let triesCounter = 0;
      while (triesCounter < this.maxTries) {
        try {
          await this.newTransport().sendMail(mailOption);
          console.log('Mail sent successfully');
          break;
        } catch (error) {
          console.log(error);
          triesCounter += 1;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  sendWelcome = async () => {
    console.log('new email');
    const html = await ejs.renderFile(path.resolve('./src/assets/welcome.ejs'), {
      name: this.name,
    });
    console.log(html);

    const subject = `Welcome ${this.name}`;
    return await this.send(subject, html);
  };

  sendCredit = async (amount: number, balance) => {
    const html = await ejs.renderFile(path.resolve('./src/assets/credit.ejs'), {
      name: this.name,
      amount,
      balance,
    });
    const subject = 'Credit notification';
    return this.send(subject, html);
  };

  sendDebit = async (amount: number, balance) => {
    const html = await ejs.renderFile(path.resolve('./src/assets/debit.ejs'), {
      name: this.name,
      amount,
      balance,
    });
    const subject = 'Debit notification';
    return await this.send(subject, html);
  };

  sendInsufficient = async (amount: number, balance) => {
    console.log('insufficient');

    const html = await ejs.renderFile(
      path.resolve('./src/assets/insufficient.ejs'),
      {
        name: this.name,
        amount,
        balance,
      }
    );
    const subject = 'Insufficeint notification';
    return await this.send(subject, html);
  };
}

export default EmailService;
