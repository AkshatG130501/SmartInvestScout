import cron from 'node-cron';
import { processMarketEvents } from './alertService';

/**
 * Initializes the scheduler for market event processing
 */
export function initializeScheduler(): void {
  // Schedule market event processing to run once per hour
  // Cron format: minute(0-59) hour(0-23) day(1-31) month(1-12) day_of_week(0-6)
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled market event processing...');
    try {
      const alertsCreated = await processMarketEvents();
      console.log(`Scheduled job completed. Created ${alertsCreated} alerts.`);
    } catch (error) {
      console.error('Error in scheduled market event processing:', error);
    }
  });

  console.log('Market event scheduler initialized');
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
