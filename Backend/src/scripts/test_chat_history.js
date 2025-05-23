// Script to test chat history functionality
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user ID - replace with a real user ID from your Supabase auth.users table
const TEST_USER_ID = process.argv[2];

if (!TEST_USER_ID) {
  console.error('Please provide a test user ID as a command line argument');
  console.log('Usage: node test_chat_history.js <user_id>');
  process.exit(1);
}

async function testChatHistory() {
  console.log('Testing Chat History Functionality...');
  console.log(`Using test user ID: ${TEST_USER_ID}`);
  
  try {
    // 1. Create a test conversation
    console.log('\n1. Creating a test conversation...');
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .insert([
        {
          user_id: TEST_USER_ID,
          title: 'Test Conversation ' + new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (conversationError) {
      throw new Error(`Error creating conversation: ${conversationError.message}`);
    }
    
    console.log('Conversation created successfully:', conversation);
    
    // 2. Add a user message to the conversation
    console.log('\n2. Adding a user message...');
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: TEST_USER_ID,
          conversation_id: conversation.id,
          content: 'This is a test user message',
          is_user_message: true
        }
      ])
      .select()
      .single();
    
    if (userMessageError) {
      throw new Error(`Error creating user message: ${userMessageError.message}`);
    }
    
    console.log('User message added successfully:', userMessage);
    
    // 3. Add an AI message to the conversation
    console.log('\n3. Adding an AI message...');
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: TEST_USER_ID,
          conversation_id: conversation.id,
          content: 'This is a test AI response',
          is_user_message: false,
          personalization_context: {
            risk_appetite: 'moderate',
            investment_goals: ['retirement', 'growth'],
            watchlist: ['AAPL', 'MSFT'],
            holdings: ['TSLA', 'AMZN']
          }
        }
      ])
      .select()
      .single();
    
    if (aiMessageError) {
      throw new Error(`Error creating AI message: ${aiMessageError.message}`);
    }
    
    console.log('AI message added successfully:', aiMessage);
    
    // 4. Fetch the conversation with messages
    console.log('\n4. Fetching the conversation with messages...');
    const { data: fetchedConversation, error: fetchError } = await supabase
      .from('chat_conversations')
      .select('*, chat_messages(*)')
      .eq('id', conversation.id)
      .eq('user_id', TEST_USER_ID)
      .single();
    
    if (fetchError) {
      throw new Error(`Error fetching conversation: ${fetchError.message}`);
    }
    
    console.log('Fetched conversation successfully:');
    console.log('Title:', fetchedConversation.title);
    console.log('Created at:', fetchedConversation.created_at);
    console.log('Last message at:', fetchedConversation.last_message_at);
    console.log('Messages:', fetchedConversation.chat_messages.length);
    
    // 5. List all conversations for the user
    console.log('\n5. Listing all conversations for the user...');
    const { data: conversations, error: listError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('last_message_at', { ascending: false });
    
    if (listError) {
      throw new Error(`Error listing conversations: ${listError.message}`);
    }
    
    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.title} (${conv.id}) - Last updated: ${conv.last_message_at}`);
    });
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testChatHistory();
