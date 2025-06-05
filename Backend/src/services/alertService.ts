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
        minImpactLevel: data[0].min_impact_level || 'medium',
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
      minImpactLevel: 'medium',
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
      minImpactLevel: 'medium',
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
      min_impact_level: preferences.minImpactLevel,
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
      return data.map((item) => ({
        userId: item.user_id,
        companies: item.companies || [],
        sectors: item.sectors || [],
        frequency: item.frequency || 'daily',
        notificationChannels: item.notification_channels || ['app'],
        minImpactLevel: item.min_impact_level || 'medium',
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
    const formattedEvents = events.map((event) => {
      const formatted = {
        event_title: event.event_title,
        summary: event.summary,
        impact_keywords: JSON.stringify(event.impact_keywords || []),
        related_companies: JSON.stringify(event.related_companies || []),
        sectors: JSON.stringify(event.sectors || []),
        timestamp: event.timestamp || new Date().toISOString(),
        source: event.source || 'API',
      };
      return formatted;
    });

    // Use insert instead of upsert to avoid ON CONFLICT issues
    const { data, error } = await supabase
      .from('market_events')
      .insert(formattedEvents)
      .select('id');

    if (error) {
      console.error('[ALERT_FLOW] ERROR: Error storing market events:', error);
      return [];
    }
    return data.map((item: { id: string }) => item.id);
  } catch (error) {
    console.error('[ALERT_FLOW] ERROR: Error in storeMarketEvents:', error);
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
          if (matchedCompanies.length > 0) {
            description += `\n\nThis event is relevant to ${matchedCompanies.join(
              ', '
            )}, which you are tracking.`;
          }
        }

        if (sectorMatch) {
          const matchedSectors = event.sectors.filter((sector) =>
            preferences.sectors.includes(sector)
          );
          if (matchedSectors.length > 0) {
            description += `\n\nThis affects the ${matchedSectors.join(
              ', '
            )} sector(s), which you are monitoring.`;
          }
        }

        userAlerts.push({
          title: event.event_title,
          description,
          category,
          timestamp: event.timestamp,
          userId,
          relatedTo: [...event.related_companies, ...event.sectors],
          isRead: false,
          eventId: event.id,
        });
      }
    }

    // If no alerts were created, return early
    if (userAlerts.length === 0) {
      return 0;
    }

    // Format alerts for database insertion
    const formattedAlerts = userAlerts.map((alert) => ({
      user_id: alert.userId,
      title: alert.title,
      description: alert.description,
      category: alert.category,
      related_to: JSON.stringify(alert.relatedTo),
      timestamp: alert.timestamp,
      is_read: alert.isRead,
      event_id: alert.eventId,
    }));

    // Insert alerts into database
    const { error } = await supabase.from('user_alerts').insert(formattedAlerts);

    if (error) {
      console.error('[ALERT_FLOW] ERROR: Error creating user alerts:', error);
      return 0;
    }
    return userAlerts.length;
  } catch (error) {
    console.error('[ALERT_FLOW] ERROR: Error in createUserAlerts:', error);
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
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map database fields to TypeScript properties
    return data.map((alert) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      category: alert.category,
      timestamp: alert.timestamp,
      userId: alert.user_id,
      relatedTo: alert.related_to || [],
      isRead: alert.is_read || false,
      eventId: alert.event_id,
    }));
  } catch (error) {
    console.error('Error in getUserAlerts:', error);
    return [];
  }
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
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

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
 * Removes duplicate alerts for a user
 * Duplicate alerts are defined as alerts with the same title, category, and description
 * @param userId User ID
 * @returns Success status
 */
export async function removeDuplicateAlerts(userId: string): Promise<boolean> {
  try {
    // First, get all alerts for the user
    const { data, error } = await supabase.from('user_alerts').select('*').eq('user_id', userId);

    if (error || !data) {
      console.error('Error fetching alerts for deduplication:', error);
      return false;
    }

    // Group alerts by title + category + description to find duplicates
    const alertGroups = new Map<string, UserAlert[]>();

    data.forEach((alert) => {
      // Create a unique key for each alert based on content
      const key = `${alert.title}|${alert.category}|${alert.description}`;

      if (!alertGroups.has(key)) {
        alertGroups.set(key, []);
      }

      alertGroups.get(key)?.push(alert);
    });

    // For each group with more than one alert, keep the most recent one and delete the rest
    const alertsToDelete: string[] = [];

    alertGroups.forEach((group) => {
      if (group.length > 1) {
        // Sort by timestamp descending (newest first)
        group.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        // Keep the first one (newest) and mark the rest for deletion
        for (let i = 1; i < group.length; i++) {
          const id = group[i].id;
          if (typeof id === 'string') {
            alertsToDelete.push(id);
          }
        }
      }
    });

    // Delete the duplicate alerts if any were found
    if (alertsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_alerts')
        .delete()
        .in('id', alertsToDelete);

      if (deleteError) {
        console.error('Error deleting duplicate alerts:', deleteError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in removeDuplicateAlerts:', error);
    return false;
  }
}

/**
 * Processes market events and creates user alerts
 * This is the main function to be called by the scheduler
 * @returns Number of alerts created
 */
export async function processMarketEvents(): Promise<number> {
  try {
    // Get all user preferences first
    const allUserPreferences = await getAllUserAlertPreferences();

    // Collect unique companies and sectors from all user preferences
    const uniqueCompanies = new Set<string>();
    const uniqueSectors = new Set<string>();

    allUserPreferences.forEach((preferences) => {
      if (Array.isArray(preferences.companies)) {
        preferences.companies.forEach((company: string) => uniqueCompanies.add(company));
      }
      if (Array.isArray(preferences.sectors)) {
        preferences.sectors.forEach((sector: string) => uniqueSectors.add(sector));
      }
    });

    // Convert Sets to Arrays
    const companies = Array.from(uniqueCompanies);
    const sectors = Array.from(uniqueSectors);

    // If no companies or sectors to monitor, return early
    if (companies.length === 0 && sectors.length === 0) {
      console.log('[ALERT_FLOW] No companies or sectors to monitor');
      return 0;
    }

    // Fetch events only for the companies and sectors users are interested in
    const events = await querySonarForEvents(companies, sectors, 168); // Last 168 hours (7 days)

    if (events.length === 0) {
      return 0;
    }

    // Store events in database
    const eventIds = await storeMarketEvents(events);

    // Add IDs to events
    const eventsWithIds = events.map((event, index) => ({
      ...event,
      id: eventIds[index],
    }));

    // Create alerts for each user
    let totalAlerts = 0;

    for (const preferences of allUserPreferences) {
      // Skip users without a userId
      if (!preferences.userId && !preferences.user_id) {
        console.warn('[ALERT_FLOW] WARNING: Skipping alert creation for user with missing ID');
        continue;
      }

      // Use either camelCase or snake_case version of the user ID
      const userId = preferences.userId || preferences.user_id || '';
      const alertsCreated = await createUserAlerts(userId, eventsWithIds, preferences);

      totalAlerts += alertsCreated;
    }
    return totalAlerts;
  } catch (error) {
    console.error('[ALERT_FLOW] ERROR: Error in processMarketEvents:', error);
    return 0;
  }
}

/**
 * Runs a manual processing of market events
 * @returns Number of alerts created
 */
export async function runManualProcessing(): Promise<number> {
  try {
    const alertsCreated = await processMarketEvents();
    return alertsCreated;
  } catch (error) {
    console.error('[ALERT_FLOW] ERROR: Error in manual market event processing:', error);
    return 0;
  }
}
