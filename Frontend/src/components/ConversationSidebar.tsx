import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  Search,
  RefreshCw,
  Trash2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { getConversations, deleteConversation } from "../lib/api/conversations";
import { Conversation } from "../lib/api/types";

interface ConversationSidebarProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
  activeConversationId?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectConversation,
  onNewChat,
  activeConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Helper function to deduplicate conversations by ID
  const deduplicateConversations = useCallback((convs: Conversation[]): Conversation[] => {
    // Log the conversations to help debug duplicates
    if (convs.length > 0) {
      const ids = convs.map(conv => conv.id);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        console.log(`Detected ${ids.length - uniqueIds.size} duplicate conversation(s)`);
      }
    }
    
    // Use a Map to ensure uniqueness by ID
    const uniqueMap = new Map<string, Conversation>();
    convs.forEach(conv => uniqueMap.set(conv.id, conv));
    return Array.from(uniqueMap.values());
  }, []);

  const fetchConversations = async (cursor?: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await getConversations(userId, 20, cursor);
      
      // Log the response to help debug
      console.log(`Fetched ${response.conversations.length} conversations${cursor ? ' with cursor' : ''}`);
      
      // Check for duplicate IDs in the response
      const responseIds = response.conversations.map(conv => conv.id);
      const uniqueResponseIds = new Set(responseIds);
      if (responseIds.length !== uniqueResponseIds.size) {
        console.warn('API returned duplicate conversations');
      }

      if (cursor) {
        // Append to existing conversations, ensuring no duplicates
        setConversations((prev) => {
          // First deduplicate the new conversations from the response
          const deduplicatedNewConversations = deduplicateConversations(response.conversations);
          
          // Then combine with previous conversations and deduplicate again
          const combined = [...prev, ...deduplicatedNewConversations];
          return deduplicateConversations(combined);
        });
      } else {
        // For initial load, just set the conversations directly after deduplication
        setConversations(deduplicateConversations(response.conversations));
      }

      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Show empty conversations instead of crashing
      if (!cursor) {
        setConversations([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort conversations based on search term
  useEffect(() => {
    // Always use the deduplicated list
    const uniqueConversations = deduplicateConversations(conversations);
    
    // Sort conversations by updated_at date (newest first)
    const sortedConversations = [...uniqueConversations].sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    
    if (!searchTerm.trim()) {
      setFilteredConversations(sortedConversations);
      return;
    }

    const searchTermLower = searchTerm.trim().toLowerCase();
    const filtered = sortedConversations.filter((conversation) => {
      // Search in title
      if (conversation.title?.toLowerCase().includes(searchTermLower)) {
        return true;
      }

      // Search in messages
      return conversation.messages.some((message) =>
        message.content.toLowerCase().includes(searchTermLower)
      );
    });

    setFilteredConversations(filtered);
  }, [searchTerm, conversations, deduplicateConversations]);

  // Initial fetch
  useEffect(() => {
    if (userId && isOpen) {
      // Clear existing conversations first to prevent duplicates
      setConversations([]);
      setFilteredConversations([]);
      setNextCursor(undefined);
      setHasMore(false);
      setSearchTerm(""); // Reset search term when opening sidebar
      fetchConversations();
    }
  }, [userId, isOpen]);

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    setIsDeleting(id);
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((conv) => conv.id !== id));

      // If the active conversation was deleted, trigger a new chat
      if (id === activeConversationId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getFirstUserMessage = (conversation: Conversation): string => {
    // Find the first user message in the conversation
    const userMessage = conversation.messages.find(
      (msg) => msg.role === "user"
    );
    return userMessage ? userMessage.content : "";
  };

  const getConversationTitle = (conversation: Conversation): string => {
    // Use the title if it exists, otherwise use the first user message
    if (conversation.title && conversation.title.trim() !== "") {
      return conversation.title;
    }
    // Get first few words of the first message
    const firstMessage = getFirstUserMessage(conversation);
    if (!firstMessage) {
      return "New conversation";
    }
    const words = firstMessage.split(" ");
    const titleWords = words.slice(0, 5);
    return titleWords.join(" ") + (words.length > 5 ? "..." : "");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 flex flex-col
        ${isOpen ? "w-80" : "w-0 opacity-0"}`}
    >
      {isOpen && (
        <>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              Conversations
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          <div className="p-3 border-b border-gray-200">
            <button
              onClick={onNewChat}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                    <p>Loading conversations...</p>
                  </div>
                ) : searchTerm ? (
                  <p>No conversations match your search.</p>
                ) : (
                  <p>No conversations yet. Start a new chat!</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {/* Add a key based on ID to ensure React properly handles updates */}
                {filteredConversations.map((conversation) => (
                  <li
                    key={conversation.id}
                    className={`hover:bg-gray-50 relative ${
                      conversation.id === activeConversationId
                        ? "bg-indigo-50"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => onSelectConversation(conversation)}
                      className="w-full text-left p-4 focus:outline-none pr-10"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900 truncate flex-1">
                          {getConversationTitle(conversation)}
                        </p>
                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          {formatDate(conversation.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {getFirstUserMessage(conversation)}
                      </p>
                    </button>
                    <button
                      onClick={(e) =>
                        handleDeleteConversation(conversation.id, e)
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                      disabled={isDeleting === conversation.id}
                    >
                      {isDeleting === conversation.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchConversations(nextCursor)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none flex items-center justify-center mx-auto"
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

export default ConversationSidebar;
