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

export interface UserAlert {
  id?: string;
  // Database fields (snake_case)
  user_id?: string;
  title: string;
  description: string;
  category: 'Earnings' | 'Strategy' | 'Regulatory' | 'Product' | 'Analyst' | 'Macro' | 'Sentiment';
  related_to?: string | string[];
  timestamp: string;
  is_read?: boolean;
  event_id?: string;
  
  // TypeScript properties (camelCase) - for frontend compatibility
  userId?: string;
  relatedTo?: string[];
  isRead?: boolean;
  eventId?: string;
}

export interface AlertPreferences {
  id?: string;
  // Database fields (snake_case)
  user_id?: string;
  companies: string[] | string;
  sectors: string[] | string;
  frequency: 'hourly' | 'daily' | 'weekly';
  notification_channels?: string | ('app' | 'email' | 'push')[];
  min_impact_level?: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
  
  // TypeScript properties (camelCase) - for frontend compatibility
  userId?: string;
  notificationChannels?: ('app' | 'email' | 'push')[];
  minImpactLevel?: 'low' | 'medium' | 'high';
}
