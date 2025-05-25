import { API_BASE_URL } from "./index";

// Define types locally until we create the proper types file
export interface UserAlert {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category:
    | "Earnings"
    | "Strategy"
    | "Regulatory"
    | "Product"
    | "Analyst"
    | "Macro"
    | "Sentiment";
  relatedTo: string[];
  timestamp: string;
  isRead: boolean;
  eventId?: string;
}

export interface AlertPreferences {
  userId: string;
  companies: string[];
  sectors: string[];
  frequency: "hourly" | "daily" | "weekly";
  notificationChannels: ("app" | "email" | "push")[];
  minImpactLevel: "low" | "medium" | "high";
}

/**
 * Fetches user alert preferences
 * @param userId User ID
 * @returns Alert preferences
 */
export async function getAlertPreferences(
  userId: string
): Promise<AlertPreferences> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/alerts/preferences?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch alert preferences");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching alert preferences:", error);
    throw error;
  }
}

/**
 * Updates user alert preferences
 * @param preferences Alert preferences to update
 * @returns Success status
 */
export async function updateAlertPreferences(
  preferences: AlertPreferences
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error("Failed to update alert preferences");
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error updating alert preferences:", error);
    throw error;
  }
}

/**
 * Fetches user alerts
 * @param userId User ID
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
    const response = await fetch(
      `${API_BASE_URL}/api/alerts?userId=${userId}&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }

    const data = await response.json();
    return data.alerts;
  } catch (error) {
    console.error("Error fetching user alerts:", error);
    throw error;
  }
}

/**
 * Marks alerts as read
 * @param userId User ID
 * @param alertIds Array of alert IDs to mark as read
 * @returns Success status
 */
export async function markAlertsAsRead(
  userId: string,
  alertIds: string[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, alertIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark alerts as read");
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error marking alerts as read:", error);
    throw error;
  }
}

/**
 * Gets unread alert count
 * @param userId User ID
 * @returns Number of unread alerts
 */
export async function getUnreadAlertCount(userId: string): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/alerts/unread/count?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch unread alert count");
    }

    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error("Error fetching unread alert count:", error);
    return 0;
  }
}
