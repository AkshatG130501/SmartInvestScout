# SmartInvestScout API Module

This directory contains the API client and related modules for the SmartInvestScout application.

## Structure

The API code is organized into domain-specific modules:

- `client.ts` - Base Axios client configuration
- `types.ts` - Shared type definitions
- `errors.ts` - Error handling utilities
- `documents.ts` - Document analysis API
- `profiles.ts` - User profile management API
- `chat.ts` - Chat and personalization API
- `index.ts` - Re-exports everything for easy importing

## Usage

### Importing API Modules

```typescript
// Import specific API functions from domain modules
import { getUserProfile } from '../lib/api/profiles';
import { getPersonalizedChatResponse } from '../lib/api/chat';

// Or import everything from the index
import { getUserProfile, getPersonalizedChatResponse } from '../lib/api';
```

### Error Handling

All API functions use consistent error handling:

```typescript
try {
  const profile = await getUserProfile(userId);
  // Handle successful response
} catch (error: unknown) {
  // Use the error utilities
  console.error(formatErrorMessage(error));
  // Handle specific error types
  if (isNotFoundError(error)) {
    // Handle 404 not found
  }
}
```

## Personalization

The chat API supports personalized responses based on user profiles, which include:

- Risk appetite (conservative, moderate, aggressive)
- Investment goals
- Watchlist
- Holdings

## Chat History

The chat API supports saving and retrieving chat history:

```typescript
// Save a chat message
await saveChatMessage(userId, userMessage, systemResponse);

// Get chat history
const history = await getChatHistory(userId);
```
