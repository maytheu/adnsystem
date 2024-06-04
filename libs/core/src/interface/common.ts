type NotificationType = 'Email' | 'Phone';

export interface PaymentData {
  amount: number;
  userId: number;
}

export interface Notify {
  amount: number;
  balance: number;
  userId: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  notifycationType: NotificationType;
}