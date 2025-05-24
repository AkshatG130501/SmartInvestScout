/**
 * @file Test API endpoints
 * @description Simple script to test if API endpoints are working correctly
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port

async function testEndpoints() {
  console.log('Testing API endpoints...\n');
  
  // Test endpoints
  const endpoints = [
    '/api/health', // Health check endpoint
    '/api/search/suggestions?query=apple', // Search suggestions endpoint
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint}`);
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    console.log('-----------------------------------\n');
  }
}

// Run the test
testEndpoints()
  .then(() => console.log('Test completed!'))
  .catch(error => console.error('Test failed:', error));
