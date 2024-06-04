class PhoneService {
  private phone: string;
  private name: string;

  constructor(phone: string, name: string) {
    this.phone = phone;
    this.name = name;
  }

  private sendTwilio() {}

  async sendNewMessage() {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
  }

  async sendCreditMessage(amount:number, balance:number) {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
  }

  async sendDebitMessage(amount:number, balance:number) {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
  }


  async sendInsuffientFundMessage(amount:number, balance:number) {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
  }
}

export default PhoneService;
