import axios from 'axios';
import { MarketEvent } from '../types/alerts';
import dotenv from 'dotenv';

// Define interfaces for Sonar API responses
interface SonarEvent {
  event_title: string;
  summary: string;
  impact_keywords?: string[];
  related_companies?: string[];
  sectors?: string[];
  timestamp?: string;
}

interface SonarResponse {
  events: SonarEvent[];
  [key: string]: any;
}

// Define interfaces for Perplexity API responses
interface PerplexityMessage {
  role: string;
  content: string;
}

interface PerplexityChoice {
  message: PerplexityMessage;
  index: number;
  finish_reason: string;
}

interface PerplexityResponse {
  id: string;
  choices: PerplexityChoice[];
  created: number;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

dotenv.config();

const SONAR_API_KEY = process.env.PERPLEXITY_API_KEY;
const SONAR_API_URL = 'https://api.perplexity.ai';

// List of top Indian companies to monitor
const TOP_INDIAN_COMPANIES = [
  'Reliance Industries',
  'TCS',
  'HDFC Bank',
  'Infosys',
  'ICICI Bank',
  'HUL',
  'Bharti Airtel',
  'SBI',
  'Bajaj Finance',
  'Kotak Mahindra Bank',
  'Adani Enterprises',
  'ITC',
  'L&T',
  'Axis Bank',
  'Asian Paints',
  'Maruti Suzuki',
  'Titan',
  'Bajaj Finserv',
  'Sun Pharma',
  'Tata Motors',
  'Tata Steel',
  'NTPC',
  'M&M',
  'Power Grid',
  'Tech Mahindra',
];

// Key sectors to monitor
const KEY_SECTORS = [
  'Banking',
  'IT',
  'Pharma',
  'Auto',
  'FMCG',
  'Energy',
  'Telecom',
  'Infrastructure',
  'PSU Banks',
  'Green Energy',
  'Manufacturing',
  'Real Estate',
  'Insurance',
  'Metals',
  'Oil & Gas',
];

/**
 * Queries Sonar API for recent market events
 * @param timeframe Time period to look back (in hours)
 * @returns Array of parsed market events
 */
export async function querySonarForEvents(timeframe: number = 4): Promise<MarketEvent[]> {
  try {
    // Create a prompt for Sonar that includes context about Indian markets
    const prompt = `Monitor and summarize important events for the following Indian companies in the past ${timeframe} hours:
    ${TOP_INDIAN_COMPANIES.join(', ')}
    
    Also monitor these sectors: ${KEY_SECTORS.join(', ')}
    
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
      console.error('Perplexity API key is missing. Please set the PERPLEXITY_API_KEY environment variable.');
      throw new Error('Perplexity API key is missing');
    }

    // Use a more compatible model and format
    const response = await axios.post(
      `${SONAR_API_URL}/chat/completions`,
      {
        model: 'mistral-7b-instruct', // Try a different model that might be more stable
        messages: [
          {
            role: 'system',
            content: 'You are a financial market intelligence system. Return responses in JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent responses
        max_tokens: 1024, // Limit response size
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          Authorization: `Bearer ${SONAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000 // 30 second timeout
      }
    );

    // Parse and validate the response
    const responseData = response.data as PerplexityResponse;
    
    // Perplexity API returns data in the choices array with content field
    if (responseData && responseData.choices && responseData.choices.length > 0) {
      // Parse the JSON content from the response
      try {
        const content = responseData.choices[0].message.content;
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
      }
    }

    console.error('Invalid response format from Sonar API');
    return [];
  } catch (error) {
    console.error('Error querying Sonar API:', error);

    // Fallback: Generate mock events when API is unavailable
    return generateMockMarketEvents();
  }
}

/**
 * Generates mock market events for fallback when API is unavailable
 * @returns Array of mock market events
 */
function generateMockMarketEvents(): MarketEvent[] {
  console.log('Using fallback mock market events');

  // Current timestamp
  const now = new Date();

  // Generate timestamps for different events (past few hours)
  const timestamp1 = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(); // 1 hour ago
  const timestamp2 = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(); // 3 hours ago
  const timestamp3 = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago
  const timestamp4 = new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(); // 8 hours ago
  const timestamp5 = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(); // 12 hours ago

  // Create a pool of events and randomly select a subset to ensure variety
  const eventPool = [
    {
      event_title: 'Reliance Industries Announces Quarterly Results',
      summary:
        'Reliance Industries reported a 15% increase in quarterly profit, exceeding analyst expectations. Strong performance in retail and digital services offset weaker refining margins.',
      impact_keywords: ['earnings', 'profit', 'growth', 'digital'],
      related_companies: ['Reliance Industries', 'Jio Platforms'],
      sectors: ['Energy', 'Telecom', 'Retail'],
      timestamp: timestamp1,
      source: 'Mock Data',
    },
    {
      event_title: 'HDFC Bank Expands Rural Banking Initiative',
      summary:
        'HDFC Bank announced plans to open 500 new branches in rural areas over the next fiscal year. The initiative aims to increase financial inclusion and capture untapped market segments.',
      impact_keywords: ['expansion', 'rural banking', 'growth strategy'],
      related_companies: ['HDFC Bank', 'SBI', 'ICICI Bank'],
      sectors: ['Banking', 'Financial Services'],
      timestamp: timestamp2,
      source: 'Mock Data',
    },
    {
      event_title: 'Government Announces New Regulatory Framework for Tech Sector',
      summary:
        'The Indian government unveiled new regulations for technology companies focusing on data privacy and localization. Tech firms will have 6 months to comply with the new requirements.',
      impact_keywords: ['regulation', 'compliance', 'data privacy'],
      related_companies: ['TCS', 'Infosys', 'Wipro', 'Tech Mahindra'],
      sectors: ['IT', 'Technology'],
      timestamp: timestamp3,
      source: 'Mock Data',
    },
    {
      event_title: 'Tata Motors Launches New Electric Vehicle Line',
      summary:
        'Tata Motors unveiled its new line of affordable electric vehicles with an extended range of 400km. The company aims to capture 30% of the Indian EV market by 2026.',
      impact_keywords: ['electric vehicles', 'innovation', 'sustainability'],
      related_companies: ['Tata Motors', 'Mahindra & Mahindra', 'Maruti Suzuki'],
      sectors: ['Auto', 'Manufacturing', 'Green Energy'],
      timestamp: timestamp4,
      source: 'Mock Data',
    },
    {
      event_title: 'RBI Announces Surprise Rate Hike',
      summary:
        'The Reserve Bank of India raised interest rates by 25 basis points to combat inflation, surprising analysts who expected rates to remain unchanged. Banking stocks showed mixed reactions.',
      impact_keywords: ['interest rates', 'monetary policy', 'inflation'],
      related_companies: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank'],
      sectors: ['Banking', 'Financial Services', 'PSU Banks'],
      timestamp: timestamp5,
      source: 'Mock Data',
    },
    {
      event_title: 'Adani Group Secures Major Infrastructure Deal',
      summary:
        'Adani Enterprises won a ₹25,000 crore contract to develop port infrastructure along the western coast. The project is expected to create 15,000 jobs and boost logistics capabilities.',
      impact_keywords: ['infrastructure', 'development', 'logistics'],
      related_companies: ['Adani Enterprises', 'L&T', 'Reliance Infrastructure'],
      sectors: ['Infrastructure', 'Construction', 'Logistics'],
      timestamp: timestamp4,
      source: 'Mock Data',
    },
    {
      event_title: 'Sun Pharma Receives USFDA Approval for New Drug',
      summary:
        'Sun Pharmaceutical received USFDA approval for its novel treatment for psoriasis. Analysts project the drug could generate annual sales of $300 million in the US market alone.',
      impact_keywords: ['drug approval', 'innovation', 'revenue growth'],
      related_companies: ['Sun Pharma', 'Dr. Reddy\'s', 'Cipla'],
      sectors: ['Pharma', 'Healthcare'],
      timestamp: timestamp3,
      source: 'Mock Data',
    }
  ];
  
  // Randomly select 3-5 events from the pool to ensure variety
  const numberOfEvents = Math.floor(Math.random() * 3) + 3; // 3 to 5 events
  const shuffledEvents = [...eventPool].sort(() => 0.5 - Math.random());
  return shuffledEvents.slice(0, numberOfEvents);
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
    const prompt = `Monitor and summarize important events related to ${entity} in the past ${timeframe} hours.
    
    For each material event, explain:
    1. What happened (be specific with numbers and facts)
    2. Why it matters for investors in ${entity}
    3. What are the potential short and long-term implications
    
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

    const response = await axios.post(
      `${SONAR_API_URL}/query`,
      {
        prompt,
        model: 'sonar-advanced-2',
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${SONAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = response.data as SonarResponse;
    if (responseData && responseData.events && Array.isArray(responseData.events)) {
      return responseData.events.map((event: SonarEvent) => ({
        event_title: event.event_title,
        summary: event.summary,
        impact_keywords: event.impact_keywords || [],
        related_companies: event.related_companies || [],
        sectors: event.sectors || [],
        timestamp: event.timestamp || new Date().toISOString(),
        source: 'Sonar',
      }));
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
