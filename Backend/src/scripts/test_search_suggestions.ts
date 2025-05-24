/**
 * @file Test search suggestions
 * @description Simple script to test the search suggestions functionality
 */

import { getSearchSuggestions } from '../services/searchService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSearchSuggestions() {
  const testQueries = ['app', 'bank', 'green', 'tech', 'crypto'];
  
  console.log('Testing search suggestions functionality...\n');
  
  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    try {
      const suggestions = await getSearchSuggestions(query);
      console.log('Suggestions:', suggestions);
      console.log('Number of suggestions:', suggestions.length);
      console.log('-----------------------------------\n');
    } catch (error) {
      console.error(`Error getting suggestions for "${query}":`, error);
    }
  }
}

// Run the test
testSearchSuggestions()
  .then(() => console.log('Test completed successfully!'))
  .catch(error => console.error('Test failed:', error));
