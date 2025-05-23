# Chat History Feature Documentation

This document outlines the implementation of the chat history feature in SmartInvestScout, which allows users to save, retrieve, and manage their chat conversations with the AI assistant.

## Database Schema

The chat history feature uses two main tables in Supabase:

### 1. `chat_conversations` Table

Stores information about each conversation:

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `chat_messages` Table

Stores individual messages within conversations:

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL,
  personalization_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security

Row Level Security (RLS) policies are implemented to ensure that users can only access their own conversations and messages:

```sql
-- Enable Row Level Security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Similar policies for INSERT, UPDATE, DELETE

-- Create policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Similar policies for INSERT, UPDATE, DELETE
```

## Backend Implementation

### Types

The backend defines the following types for chat history:

```typescript
// ChatConversation interface
export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  created_at: string;
  messages?: ChatMessage[];
}

// ChatMessage interface
export interface ChatMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  content: string;
  is_user_message: boolean;
  personalization_context?: {
    risk_appetite: string;
    investment_goals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
  created_at: string;
}
```

### Services

The `ChatHistoryService` class provides methods for:

1. Getting user conversations
2. Getting a specific conversation with messages
3. Creating a new conversation
4. Updating a conversation title
5. Deleting a conversation
6. Adding messages to a conversation
7. Searching conversations and messages

### API Routes

The backend exposes the following endpoints for chat history:

- `GET /api/chat-history/conversations/:userId` - Get all conversations for a user
- `GET /api/chat-history/conversations/:userId/:conversationId` - Get a specific conversation with messages
- `POST /api/chat-history/conversations/:userId` - Create a new conversation
- `PUT /api/chat-history/conversations/:userId/:conversationId` - Update a conversation title
- `DELETE /api/chat-history/conversations/:userId/:conversationId` - Delete a conversation
- `POST /api/chat-history/messages/:userId` - Add a message to a conversation
- `GET /api/chat-history/search/conversations/:userId` - Search conversations by title
- `GET /api/chat-history/search/messages/:userId/:conversationId` - Search messages within a conversation

## Frontend Implementation

### API Client

The frontend API client includes methods for interacting with the chat history endpoints:

```typescript
// Get all conversations for a user
export const getUserConversations = async (userId: string): Promise<ChatConversation[]>

// Get a specific conversation with messages
export const getConversation = async (userId: string, conversationId: string): Promise<ChatConversation | null>

// Create a new conversation
export const createConversation = async (userId: string, data: CreateConversationInput): Promise<ChatConversation>

// Update a conversation title
export const updateConversationTitle = async (userId: string, conversationId: string, title: string): Promise<void>

// Delete a conversation
export const deleteConversation = async (userId: string, conversationId: string): Promise<void>

// Add a message to a conversation
export const createMessage = async (userId: string, data: CreateMessageInput): Promise<ChatMessage>

// Search conversations by title
export const searchConversations = async (userId: string, query: string): Promise<ChatConversation[]>
```

### Chat Component

The Chat component has been updated to:

1. Display a sidebar with the user's conversation history
2. Allow users to select and view previous conversations
3. Create new conversations automatically when a user sends a message
4. Save all messages to the database
5. Allow users to delete conversations
6. Support searching through conversation history

## Testing

A test script is provided at `/Backend/src/scripts/test_chat_history.js` to verify the functionality of the chat history feature. This script:

1. Creates a test conversation
2. Adds user and AI messages to the conversation
3. Fetches the conversation with messages
4. Lists all conversations for the user

## Usage

To use the chat history feature:

1. Ensure the Supabase tables are created using the SQL script in `/Backend/src/scripts/create_chat_history_tables.sql`
2. Start the backend server
3. Navigate to the Chat page in the frontend
4. Send messages to create conversations
5. Use the "Chat History" button to view and manage previous conversations

## Future Enhancements

Potential future enhancements for the chat history feature:

1. Conversation renaming
2. Message editing and deletion
3. Conversation categorization and tagging
4. Export/import of conversation history
5. Advanced search capabilities (full-text search)
