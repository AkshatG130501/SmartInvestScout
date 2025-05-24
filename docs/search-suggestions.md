# Search Suggestions Feature

## Overview

The search suggestions feature provides real-time suggestions as users type in the search box on the dashboard. This enhances user experience by helping them discover relevant stocks, companies, and investment domains quickly.

## Features

- Real-time suggestions as the user types
- Debounced API calls to optimize performance
- Fallback to local data when API is unavailable
- Suggestions from multiple sources:
  - Financial Modeling Prep API (primary source)
  - Local database of popular stocks and companies (fallback)
  - Investment domains and sectors
  - User's previous search history

## Implementation Details

### Backend

1. **Search Service**: `searchService.ts` provides functions for fetching search suggestions and saving search queries.
2. **API Endpoints**:
   - `GET /api/search/suggestions`: Returns search suggestions based on user input
   - `POST /api/search/history`: Saves a search query to history
3. **Database**: The `search_history` table stores user search queries for future suggestions.

### Frontend

1. **API Client**: `search.ts` provides functions for interacting with the search API.
2. **Debounce Hook**: `useDebounce.ts` prevents excessive API calls as the user types.
3. **Dashboard Component**: Displays suggestions in a dropdown as the user types.

## Setup Instructions

1. **Database Setup**:
   - Run the migration script to create the `search_history` table:
     ```
     npm run migrate:search
     ```

2. **API Key (Optional but Recommended)**:
   - Sign up for a free API key at [Financial Modeling Prep](https://financialmodelingprep.com/developer/docs/)
   - Add the API key to your `.env` file:
     ```
     FMP_API_KEY=your_api_key_here
     ```
   - Without an API key, the system will use the free tier with limited requests or fall back to local data.

## Usage

Users can simply start typing in the search box on the dashboard, and suggestions will appear in a dropdown. Clicking on a suggestion will navigate to the search results page for that item.

## Fallback Mechanism

If the external API is unavailable or rate-limited, the system will automatically fall back to using local data from:
- A curated list of popular stocks and companies
- Common investment domains and sectors
- The user's previous search history

This ensures that search suggestions are always available, even when external services are down.
