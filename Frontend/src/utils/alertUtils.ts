/**
 * @file Alert Utilities
 * @description Helper functions for working with alerts
 */

/**
 * Extract topics from a conversation for alert matching
 * @param messages Array of message contents
 * @returns Array of potential topics for alert matching
 */
export const extractTopicsFromMessages = (messages: string[]): string[] => {
  // Simple extraction of potential company names and topics
  // This could be enhanced with NLP in a production environment
  const topics: Set<string> = new Set();
  
  // Common stock tickers and company names to look for
  const stockPatterns = [
    // Match stock tickers like $AAPL or MSFT
    /\$?([A-Z]{1,5})\b/g,
    // Match common company names
    /\b(Apple|Microsoft|Google|Amazon|Tesla|Facebook|Meta|Netflix|Nvidia|AMD|Intel)\b/gi,
    // Match sectors
    /\b(Technology|Finance|Healthcare|Energy|Consumer|Retail|Manufacturing|Automotive)\b/gi
  ];
  
  messages.forEach(message => {
    stockPatterns.forEach(pattern => {
      const matches = [...message.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          topics.add(match[1]);
        }
      });
    });
  });
  
  return Array.from(topics);
};

/**
 * Format alert for use in a chat message
 * @param alert The alert to format
 * @returns Formatted string for the alert
 */
export const formatAlertForChat = (alert: any): string => {
  if (!alert) {
    return 'Alert information not available';
  }
  
  // Safely extract properties with fallbacks
  const title = alert.title || 'Untitled Alert';
  const description = alert.description || 'No description available';
  const category = alert.category || 'Uncategorized';
  const timestamp = alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Unknown time';
  
  // Handle relatedTo property which could be an array, string, or missing
  let relatedToText = 'N/A';
  if (alert.relatedTo) {
    if (Array.isArray(alert.relatedTo)) {
      relatedToText = alert.relatedTo.length > 0 ? alert.relatedTo.join(', ') : 'N/A';
    } else if (typeof alert.relatedTo === 'string') {
      try {
        // Try to parse it as JSON in case it's a stringified array
        const parsed = JSON.parse(alert.relatedTo);
        relatedToText = Array.isArray(parsed) ? parsed.join(', ') : alert.relatedTo;
      } catch {
        relatedToText = alert.relatedTo;
      }
    }
  }
  
  return `
### ${title}

${description}

**Category:** ${category}
**Related to:** ${relatedToText}
**Time:** ${timestamp}
  `.trim();
};
