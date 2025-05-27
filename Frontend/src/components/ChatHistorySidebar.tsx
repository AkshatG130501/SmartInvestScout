import React, { useState, useEffect } from 'react';
import { Clock, X, ChevronRight, Search, RefreshCw } from 'lucide-react';
import { getChatHistory } from '../lib/api/chat';
import { ChatMessage } from '../lib/api/types';

interface ChatHistorySidebarProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (message: string, response: string, personalizationContext: any) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectChat
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<ChatMessage[]>([]);

  const fetchChatHistory = async (cursor?: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await getChatHistory(userId, 20, cursor);
      
      if (cursor) {
        // Append to existing history
        setChatHistory(prev => [...prev, ...response.messages]);
      } else {
        // Replace history
        setChatHistory(response.messages);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter chat history based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(chatHistory);
      return;
    }
    
    const filtered = chatHistory.filter(chat => 
      chat.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.response.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredHistory(filtered);
  }, [searchTerm, chatHistory]);

  // Initial fetch
  useEffect(() => {
    if (isOpen && userId) {
      fetchChatHistory();
    }
  }, [isOpen, userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 transition-all duration-300 flex flex-col
        ${isOpen ? 'w-80' : 'w-0 opacity-0'}`}
    >
      {isOpen && (
        <>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center transition-colors duration-300">
              <Clock className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
              Chat History
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 transition-colors duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 transition-colors duration-300" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                    <p>Loading conversations...</p>
                  </div>
                ) : searchTerm ? (
                  <p>No conversations match your search.</p>
                ) : (
                  <p>No conversation history found.</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors duration-300">
                {filteredHistory.map((chat) => (
                  <li key={chat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <button
                      onClick={() => onSelectChat(
                        chat.message, 
                        chat.response, 
                        chat.personalization_context || null
                      )}
                      className="w-full text-left p-4 focus:outline-none"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate flex-1 transition-colors duration-300">
                          {truncateText(chat.message)}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap transition-colors duration-300">
                          {formatDate(chat.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 transition-colors duration-300">
                        {truncateText(chat.response.replace(/[#*`]/g, ''), 100)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchChatHistory(nextCursor)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none flex items-center justify-center mx-auto transition-colors duration-300"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  Load more
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHistorySidebar;
