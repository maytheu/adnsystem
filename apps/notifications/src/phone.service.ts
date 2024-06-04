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

  async sendCreditMessage() {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
  }

  async sendInsuffientFundMessage() {
    const text = `Hi ${this.name}, welcome to a new world of convienency`;
  }
}

export default PhoneService;
