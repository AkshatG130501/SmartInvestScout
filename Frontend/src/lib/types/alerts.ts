export interface UserAlert {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: 'Earnings' | 'Strategy' | 'Regulatory' | 'Product' | 'Analyst' | 'Macro' | 'Sentiment';
  relatedTo: string[];
  timestamp: string;
  isRead: boolean;
  eventId?: string;
}

export interface AlertPreferences {
  userId: string;
  companies: string[];
  sectors: string[];
  frequency: 'hourly' | 'daily' | 'weekly';
  notificationChannels: ('app' | 'email' | 'push')[];
  minImpactLevel: 'low' | 'medium' | 'high';
}

export interface MarketEvent {
  id?: string;
  event_title: string;
  summary: string;
  impact_keywords: string[];
  related_companies: string[];
  sectors: string[];
  timestamp: string;
  source?: string;
}
