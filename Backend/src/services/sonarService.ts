import axios from 'axios';
import { MarketEvent } from '../types/alerts';
import { SonarEvent, SonarResponse, PerplexityResponse } from '../types/sonar';
import dotenv from 'dotenv';

dotenv.config();

const SONAR_API_KEY = process.env.PERPLEXITY_API_KEY;
const SONAR_API_URL = 'https://api.perplexity.ai';

/**
 * Queries Sonar API for recent market events
 * @param companies List of companies to monitor
 * @param sectors List of sectors to monitor
 * @param timeframe Time period to look back (in hours)
 * @returns Array of parsed market events
 */
export async function querySonarForEvents(
  companies: string[],
  sectors: string[],
  timeframe: number = 4
): Promise<MarketEvent[]> {
  console.log(`[ALERT_FLOW] 1. Starting querySonarForEvents with timeframe: ${timeframe} hours`);
  try {
    // Create a prompt for Sonar that includes context about Indian markets
    console.log(
      `[ALERT_FLOW] 2. Creating prompt with ${companies.length} companies and ${sectors.length} sectors`
    );
    const prompt = `Monitor and summarize important events for the following Indian companies in the past ${timeframe} hours:
    ${companies.join(', ')}
    
    Also monitor these sectors: ${sectors.join(', ')}
    
    For each material event, explain:
    1. What happened (be specific with numbers and facts)
    2. Why it matters for investors
    3. Which companies are directly and indirectly affected
    
    Focus only on material events that could impact stock prices or investor decisions.
    Return results as JSON in the following format:
    {
      "events": [
        {
          "event_title": "Clear, concise title",
          "summary": "2-3 sentence explanation",
          "impact_keywords": ["keyword1", "keyword2"],
          "related_companies": ["Company1", "Company2"],
          "sectors": ["Sector1", "Sector2"],
          "timestamp": "ISO timestamp"
        }
      ]
    }`;

    // Check if API key is available
    if (!SONAR_API_KEY) {
      console.error(
        '[ALERT_FLOW] ERROR: Perplexity API key is missing. Please set the PERPLEXITY_API_KEY environment variable.'
      );
      throw new Error('Perplexity API key is missing');
    }

    console.log('[ALERT_FLOW] 3. Making API request to Perplexity');
    console.log('[ALERT_FLOW] 3.1. API URL:', SONAR_API_URL);
    console.log('[ALERT_FLOW] 3.2. Using API Key:', SONAR_API_KEY ? 'Present' : 'Missing');

    const startTime = Date.now();
    const response = await axios.post(
      `${SONAR_API_URL}/chat/completions`,
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial market intelligence system. Return responses in JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${SONAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );
    const requestDuration = Date.now() - startTime;
    console.log(`[ALERT_FLOW] 4. Received API response in ${requestDuration}ms`);
    console.log('[ALERT_FLOW] 4.1. Response status:', response.status);
    console.log('[ALERT_FLOW] 4.2. Response headers:', JSON.stringify(response.headers));

    // Parse and validate the response
    console.log(`[ALERT_FLOW] 5. Parsing response data`);
    const responseData = response.data as PerplexityResponse;
    console.log(
      `[ALERT_FLOW] 5.1. Response model: ${responseData.model}, tokens used: ${responseData.usage?.total_tokens || 'unknown'}`
    );

    // Perplexity API returns data in the choices array with content field
    if (responseData && responseData.choices && responseData.choices.length > 0) {
      console.log(`[ALERT_FLOW] 6. Response contains ${responseData.choices.length} choices`);
      // Parse the JSON content from the response
      try {
        let content = responseData.choices[0].message.content;
        console.log(`[ALERT_FLOW] 7. Raw content from API:`, content);

        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.replace(/```json\n/g, '').replace(/```/g, '');
          console.log(`[ALERT_FLOW] 7.1. Cleaned content:`, content);
        }

        const parsedContent = JSON.parse(content) as SonarResponse;
        console.log(`[ALERT_FLOW] 7.1. Parsed content:`, JSON.stringify(parsedContent, null, 2));

        if (parsedContent && parsedContent.events && Array.isArray(parsedContent.events)) {
          console.log(`[ALERT_FLOW] 8. Successfully parsed ${parsedContent.events.length} events`);

          const mappedEvents = parsedContent.events.map((event: SonarEvent) => {
            const mappedEvent = {
              event_title: event.event_title,
              summary: event.summary,
              impact_keywords: event.impact_keywords || [],
              related_companies: event.related_companies || [],
              sectors: event.sectors || [],
              timestamp: event.timestamp || new Date().toISOString(),
              source: 'Perplexity',
            };
            console.log(`[ALERT_FLOW] 8.1. Mapped event: ${mappedEvent.event_title}`);
            return mappedEvent;
          });

          console.log(`[ALERT_FLOW] 9. Returning ${mappedEvents.length} mapped events`);
          return mappedEvents;
        } else {
          console.error(
            '[ALERT_FLOW] ERROR: Parsed content missing events array or not in expected format'
          );
          console.error('[ALERT_FLOW] ERROR: Parsed content:', parsedContent);
          return [];
        }
      } catch (parseError) {
        console.error(
          '[ALERT_FLOW] ERROR: Error parsing JSON from Perplexity response:',
          parseError
        );
        return [];
      }
    }

    console.error('[ALERT_FLOW] ERROR: Invalid response format from Sonar API');
    console.error('[ALERT_FLOW] ERROR: Response data:', responseData);
    return [];
  } catch (error) {
    console.error('[ALERT_FLOW] ERROR: Error querying Sonar API:', error);
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
          headers?: Record<string, string>;
        };
      };
      console.error('[ALERT_FLOW] ERROR: API Error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
      });
    }
    return [];
  }
}

/**
 * Queries Sonar for specific company or sector events
 * @param entity Company name or sector
 * @param timeframe Time period to look back (in hours)
 * @returns Array of parsed market events
 */
export async function queryEntitySpecificEvents(
  entity: string,
  timeframe: number = 24
): Promise<MarketEvent[]> {
  try {
    const prompt = `
You are a financial analyst assistant. Summarize material market-moving events for Indian stocks and sectors.

Focus on the following:
- Timeframe: past ${timeframe} hours

Instructions:
1. Highlight only significant news or developments (e.g., earnings reports, regulatory decisions, large price moves, M&A, etc.)
2. For each event, include:
   - What happened (with numbers, dates, or facts)
   - Why it matters to investors
   - Who is affected (companies/sectors)

Return the result as a JSON like:
{
  "events": [
    {
      "event_title": "Brief title of the event",
      "summary": "1-2 line investor-focused explanation",
      "impact_keywords": ["earnings", "acquisition", "regulatory"],
      "related_companies": ["Reliance Industries", "TCS"],
      "sectors": ["Energy", "Technology"],
      "timestamp": "ISO 8601 timestamp"
    }
  ]
}

If no material events are found, return:
{
  "events": []
}
`;

    const response = await axios.post(
      `${SONAR_API_URL}/chat/completions`,
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial market intelligence system. Return responses in JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${SONAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = response.data as PerplexityResponse;

    // Perplexity API returns data in the choices array with content field
    if (responseData && responseData.choices && responseData.choices.length > 0) {
      // Parse the JSON content from the response
      try {
        let content = responseData.choices[0].message.content;

        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.replace(/```json\n/g, '').replace(/```/g, '');
        }

        const parsedContent = JSON.parse(content) as SonarResponse;

        if (parsedContent && parsedContent.events && Array.isArray(parsedContent.events)) {
          return parsedContent.events.map((event: SonarEvent) => ({
            event_title: event.event_title,
            summary: event.summary,
            impact_keywords: event.impact_keywords || [],
            related_companies: event.related_companies || [],
            sectors: event.sectors || [],
            timestamp: event.timestamp || new Date().toISOString(),
            source: 'Perplexity',
          }));
        }
      } catch (parseError) {
        console.error('Error parsing JSON from Perplexity response:', parseError);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error(`Error querying Sonar API for ${entity}:`, error);
    return [];
  }
}

/**
 * Categorizes an event based on its content
 * @param event The market event to categorize
 * @returns The category of the event
 */
export function categorizeEvent(
  event: MarketEvent
): 'Earnings' | 'Strategy' | 'Regulatory' | 'Product' | 'Analyst' | 'Macro' | 'Sentiment' {
  const { event_title, summary, impact_keywords } = event;
  const content = `${event_title} ${summary} ${impact_keywords.join(' ')}`.toLowerCase();

  if (
    content.includes('earnings') ||
    content.includes('revenue') ||
    content.includes('profit') ||
    content.includes('quarterly') ||
    content.includes('financial results')
  ) {
    return 'Earnings';
  }

  if (
    content.includes('acquisition') ||
    content.includes('merger') ||
    content.includes('partnership') ||
    content.includes('investment') ||
    content.includes('strategy') ||
    content.includes('deal')
  ) {
    return 'Strategy';
  }

  if (
    content.includes('regulation') ||
    content.includes('policy') ||
    content.includes('government') ||
    content.includes('compliance') ||
    content.includes('law') ||
    content.includes('sebi')
  ) {
    return 'Regulatory';
  }

  if (
    content.includes('launch') ||
    content.includes('product') ||
    content.includes('service') ||
    content.includes('innovation') ||
    content.includes('technology')
  ) {
    return 'Product';
  }

  if (
    content.includes('analyst') ||
    content.includes('rating') ||
    content.includes('upgrade') ||
    content.includes('downgrade') ||
    content.includes('target price')
  ) {
    return 'Analyst';
  }

  if (
    content.includes('economy') ||
    content.includes('inflation') ||
    content.includes('interest rate') ||
    content.includes('gdp') ||
    content.includes('rbi') ||
    content.includes('global')
  ) {
    return 'Macro';
  }

  return 'Sentiment';
}
