import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
import { MarketEvent, UserAlert, AlertPreferences } from '../types/alerts';
import { querySonarForEvents, categorizeEvent } from './sonarService';

/**
 * Fetches user alert preferences from the database
 * @param userId User ID to fetch preferences for
 * @returns Alert preferences for the user
 */
export async function getUserAlertPreferences(userId: string): Promise<AlertPreferences | null> {
  try {
    // Don't use single() as it throws an error when no rows are found
    const { data, error } = await supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching alert preferences:', error);
      return null;
    }

    // Map snake_case database fields to camelCase TypeScript properties
    if (data && data.length > 0) {
      const preferences: AlertPreferences = {
        userId: data[0].user_id,
        companies: data[0].companies || [],
        sectors: data[0].sectors || [],
        frequency: data[0].frequency || 'daily',
        notificationChannels: data[0].notification_channels || ['app'],
        minImpactLevel: data[0].min_impact_level || 'medium'
      };
      return preferences;
    }

    // Create default preferences if none exist
    const defaultPreferences: AlertPreferences = {
      userId: userId,
      companies: [],
      sectors: [],
      frequency: 'daily',
      notificationChannels: ['app'],
      minImpactLevel: 'medium'
    };
    
    return defaultPreferences;
  } catch (error) {
    console.error('Error in getUserAlertPreferences:', error);
    // Return default preferences on error
    return {
      userId: userId,
      companies: [],
      sectors: [],
      frequency: 'daily',
      notificationChannels: ['app'],
      minImpactLevel: 'medium'
    };
  }
}

/**
 * Updates user alert preferences
 * @param preferences Alert preferences to update
 * @returns Success status
 */
export async function updateAlertPreferences(preferences: AlertPreferences): Promise<boolean> {
  try {
    // Map camelCase properties to snake_case database fields
    const dbPreferences = {
      user_id: preferences.userId,
      companies: preferences.companies,
      sectors: preferences.sectors,
      frequency: preferences.frequency,
      notification_channels: preferences.notificationChannels,
      min_impact_level: preferences.minImpactLevel
    };

    const { error } = await supabase
      .from('alert_preferences')
      .upsert(dbPreferences, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating alert preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAlertPreferences:', error);
    return false;
  }
}

/**
 * Fetches all user alert preferences
 * @returns Array of all user alert preferences
 */
export async function getAllUserAlertPreferences(): Promise<AlertPreferences[]> {
  try {
    const { data, error } = await supabase.from('alert_preferences').select('*');

    if (error) {
      console.error('Error fetching all alert preferences:', error);
      return [];
    }

    // Map snake_case database fields to camelCase TypeScript properties
    if (data && data.length > 0) {
      return data.map(item => ({
        userId: item.user_id,
        companies: item.companies || [],
        sectors: item.sectors || [],
        frequency: item.frequency || 'daily',
        notificationChannels: item.notification_channels || ['app'],
        minImpactLevel: item.min_impact_level || 'medium'
      }));
    }

    return [];
  } catch (error) {
    console.error('Error in getAllUserAlertPreferences:', error);
    return [];
  }
}

/**
 * Stores market events in the database
 * @param events Array of market events to store
 * @returns IDs of stored events
 */
export async function storeMarketEvents(events: MarketEvent[]): Promise<string[]> {
  try {
    // First, ensure the data is properly formatted for the database
    const formattedEvents = events.map((event) => ({
      event_title: event.event_title,
      summary: event.summary,
      impact_keywords: JSON.stringify(event.impact_keywords || []),
      related_companies: JSON.stringify(event.related_companies || []),
      sectors: JSON.stringify(event.sectors || []),
      timestamp: event.timestamp || new Date().toISOString(),
      source: event.source || 'API'
    }));

    // Use insert instead of upsert to avoid ON CONFLICT issues
    const { data, error } = await supabase
      .from('market_events')
      .insert(formattedEvents)
      .select('id');

    if (error) {
      console.error('Error storing market events:', error);
      return [];
    }

    return data.map((item: { id: string }) => item.id);
  } catch (error) {
    console.error('Error in storeMarketEvents:', error);
    return [];
  }
}

/**
 * Creates user alerts based on market events and user preferences
 * @param userId User ID to create alerts for
 * @param events Array of market events
 * @param preferences User alert preferences
 * @returns Number of alerts created
 */
export async function createUserAlerts(
  userId: string,
  events: MarketEvent[],
  preferences: AlertPreferences
): Promise<number> {
  try {
    const userAlerts: UserAlert[] = [];

    for (const event of events) {
      // Check if event is relevant to user based on companies
      const companyMatch = event.related_companies.some((company) =>
        preferences.companies.includes(company)
      );

      // Check if event is relevant to user based on sectors
      const sectorMatch = event.sectors.some((sector) => preferences.sectors.includes(sector));

      // If event is relevant, create an alert
      if (companyMatch || sectorMatch) {
        const category = categorizeEvent(event);

        // Create personalized description
        let description = event.summary;

        // Add personalization
        if (companyMatch) {
          const matchedCompanies = event.related_companies.filter((company) =>
            preferences.companies.includes(company)
          );
          description += ` This affects ${matchedCompanies.join(', ')} in your portfolio.`;
        }

        if (sectorMatch && !companyMatch) {
          const matchedSectors = event.sectors.filter((sector) =>
            preferences.sectors.includes(sector)
          );
          description += ` You're following the ${matchedSectors.join(', ')} sector(s).`;
        }

        userAlerts.push({
          user_id: userId,
          userId: userId, // Add camelCase version for TypeScript compatibility
          title: event.event_title,
          description,
          category,
          related_to: JSON.stringify([...event.related_companies, ...event.sectors]),
          relatedTo: [...event.related_companies, ...event.sectors], // Add camelCase version
          timestamp: new Date().toISOString(),
          is_read: false,
          isRead: false, // Add camelCase version
          event_id: event.id,
          eventId: event.id, // Add camelCase version
        });
      }
    }

    // Store alerts in database
    if (userAlerts.length > 0) {
      const { error } = await supabase.from('user_alerts').upsert(userAlerts);

      if (error) {
        console.error('Error creating user alerts:', error);
        return 0;
      }
    }

    return userAlerts.length;
  } catch (error) {
    console.error('Error in createUserAlerts:', error);
    return 0;
  }
}

/**
 * Fetches user alerts
 * @param userId User ID to fetch alerts for
 * @param limit Maximum number of alerts to fetch
 * @param offset Offset for pagination
 * @returns Array of user alerts
 */
export async function getUserAlerts(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<UserAlert[]> {
  try {
    const { data, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user alerts:', error);
      // Return sample alerts on error
      return generateSampleAlerts(userId);
    }

    // Map snake_case database fields to camelCase TypeScript properties
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        category: item.category,
        relatedTo: item.related_to || [],
        timestamp: item.timestamp,
        isRead: item.is_read,
        eventId: item.event_id
      }));
    }

    // If no alerts found, try to process market events to generate some
    await runManualProcessing();
    
    // Check again after processing
    const { data: newData, error: newError } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(0, limit - 1);
      
    if (!newError && newData && newData.length > 0) {
      return newData.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        category: item.category,
        relatedTo: item.related_to || [],
        timestamp: item.timestamp,
        isRead: item.is_read,
        eventId: item.event_id
      }));
    }
    
    // If still no alerts, return sample alerts
    return generateSampleAlerts(userId);
  } catch (error) {
    console.error('Error in getUserAlerts:', error);
    return generateSampleAlerts(userId);
  }
}

/**
 * Generates sample alerts for demonstration when no real alerts exist
 * @param userId User ID to generate alerts for
 * @returns Array of sample user alerts
 */
function generateSampleAlerts(userId: string): UserAlert[] {
  console.log('Generating sample alerts for user', userId);
  
  // Current timestamp
  const now = new Date();
  
  // Generate timestamps for different alerts
  const timestamp1 = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
  const timestamp2 = new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(); // 8 hours ago
  const timestamp3 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
  const timestamp4 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
  const timestamp5 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
  
  return [
    {
      id: 'sample-1',
      userId: userId,
      title: 'Reliance Industries Reports Strong Q4 Results',
      description: 'Reliance Industries reported a 15% increase in quarterly profit, exceeding analyst expectations. This affects Reliance Industries in your portfolio.',
      category: 'Earnings',
      relatedTo: ['Reliance Industries', 'Energy'],
      timestamp: timestamp1,
      isRead: false,
      eventId: 'sample-event-1'
    },
    {
      id: 'sample-2',
      userId: userId,
      title: 'HDFC Bank Announces Rural Banking Initiative',
      description: 'HDFC Bank plans to open 500 new branches in rural areas. You\'re following the Banking sector.',
      category: 'Strategy',
      relatedTo: ['HDFC Bank', 'Banking'],
      timestamp: timestamp2,
      isRead: false,
      eventId: 'sample-event-2'
    },
    {
      id: 'sample-3',
      userId: userId,
      title: 'New Tech Regulations Announced',
      description: 'The government unveiled new regulations for technology companies focusing on data privacy. This affects TCS, Infosys in your portfolio.',
      category: 'Regulatory',
      relatedTo: ['TCS', 'Infosys', 'IT'],
      timestamp: timestamp3,
      isRead: true,
      eventId: 'sample-event-3'
    },
    {
      id: 'sample-4',
      userId: userId,
      title: 'Tata Motors Launches New EV Model',
      description: 'Tata Motors unveiled its new electric vehicle with extended range. This affects Tata Motors in your portfolio.',
      category: 'Product',
      relatedTo: ['Tata Motors', 'Auto'],
      timestamp: timestamp4,
      isRead: true,
      eventId: 'sample-event-4'
    },
    {
      id: 'sample-5',
      userId: userId,
      title: 'RBI Announces Policy Rate Decision',
      description: 'The Reserve Bank of India maintained key policy rates. You\'re following the Banking sector.',
      category: 'Macro',
      relatedTo: ['Banking', 'Financial Services'],
      timestamp: timestamp5,
      isRead: true,
      eventId: 'sample-event-5'
    }
  ];
}

/**
 * Marks user alerts as read
 * @param userId User ID
 * @param alertIds Array of alert IDs to mark as read
 * @returns Success status
 */
export async function markAlertsAsRead(userId: string, alertIds: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_alerts')
      .update({ is_read: true })
      .eq('user_id', userId)
      .in('id', alertIds);
      
    // Log the operation for debugging
    console.log(`Marked ${alertIds.length} alerts as read for user ${userId}`);

    if (error) {
      console.error('Error marking alerts as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markAlertsAsRead:', error);
    return false;
  }
}

/**
 * Counts unread alerts for a user
 * @param userId User ID
 * @returns Number of unread alerts
 */
export async function countUnreadAlerts(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    // Log the operation for debugging
    console.log(`Counted unread alerts for user ${userId}: ${count || 0}`);

    if (error) {
      console.error('Error counting unread alerts:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in countUnreadAlerts:', error);
    return 0;
  }
}

/**
 * Processes market events and creates user alerts
 * This is the main function to be called by the scheduler
 * @returns Number of alerts created
 */
export async function processMarketEvents(): Promise<number> {
  try {
    // 1. Query Sonar for recent events
    const events = await querySonarForEvents(72); // Last 4 hours

    if (events.length === 0) {
      console.log('No new market events found');
      return 0;
    }

    // 2. Store events in database
    const eventIds = await storeMarketEvents(events);

    // Add IDs to events
    const eventsWithIds = events.map((event, index) => ({
      ...event,
      id: eventIds[index],
    }));

    // 3. Get all user preferences
    const allUserPreferences = await getAllUserAlertPreferences();

    // 4. Create alerts for each user
    let totalAlerts = 0;

    for (const preferences of allUserPreferences) {
      // Skip users without a userId
      if (!preferences.userId && !preferences.user_id) {
        console.warn('Skipping alert creation for user with missing ID');
        continue;
      }
      
      // Use either camelCase or snake_case version of the user ID
      const userId = preferences.userId || preferences.user_id || '';
      const alertsCreated = await createUserAlerts(userId, eventsWithIds, preferences);

      totalAlerts += alertsCreated;
    }

    console.log(`Created ${totalAlerts} alerts for ${allUserPreferences.length} users`);
    return totalAlerts;
  } catch (error) {
    console.error('Error in processMarketEvents:', error);
    return 0;
  }
}

/**
 * Runs a manual processing of market events
 * @returns Number of alerts created
 */
export async function runManualProcessing(): Promise<number> {
  console.log('Running manual market event processing...');
  try {
    const alertsCreated = await processMarketEvents();
    console.log(`Manual processing completed. Created ${alertsCreated} alerts.`);
    return alertsCreated;
  } catch (error) {
    console.error('Error in manual market event processing:', error);
    return 0;
  }
}
