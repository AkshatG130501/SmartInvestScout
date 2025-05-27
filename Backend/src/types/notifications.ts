export interface PricingSubscriber {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'unsubscribed';
  preferences?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
}
