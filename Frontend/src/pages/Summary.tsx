import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Send, Bot, User, Loader2 } from "lucide-react";
import Button from "../components/Button";
import { DocumentSummary } from "../lib/api";
import { getPersonalizedChatResponse } from "../lib/api/chat";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  personalizationContext?: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}

const defaultSummary: DocumentSummary = {
  documentType: "Unknown Document",
  overview: "No document summary available. Please upload a document first.",
  sections: {},
};

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [summary, setSummary] = useState<DocumentSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedSummary = sessionStorage.getItem("documentSummary");
    if (storedSummary) {
      try {
        setSummary(JSON.parse(storedSummary));
      } catch (error) {
        console.error("Error parsing document summary:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/documents/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summary }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "document-summary.pdf";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    setShowChat(true);
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    // Add the user message to the UI immediately
    setMessages((prev) => [...prev, userMessage]);
    
    try {
      // Prepare context about the document for the AI
      const documentContext = `Document Type: ${summary.documentType}\n\nOverview: ${summary.overview}`;
      
      // Combine the user's question with document context
      const enhancedQuery = `Context about the document:\n${documentContext}\n\nUser question: ${question.trim()}`;
      
      // Get response from the API
      const response = await getPersonalizedChatResponse(
        user?.id || 'anonymous',
        enhancedQuery
      );

      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        personalizationContext: response.personalizationContext,
      };

      // Add the AI response to the UI
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      
      // Create error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      // Add the error message to the UI
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAsking(false);
      setQuestion("");
    }
  };

  const renderSectionContent = (content: unknown) => {
    // If content is an array of objects (like keyMetrics)
    if (
      Array.isArray(content) &&
      content.length > 0 &&
      typeof content[0] === "object"
    ) {
      const firstItem = content[0] as Record<string, unknown>;
      const keys = Object.keys(firstItem);

      if (keys.length > 0) {
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {keys.map((key) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .trim()
                        .charAt(0)
                        .toUpperCase() +
                        key
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                          .slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {keys.map((key) => (
                      <td
                        key={`${rowIndex}-${key}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {String((item as Record<string, unknown>)[key] || "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // If content is a simple array of strings or numbers, render as a list
    else if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-4 space-y-2">
          {content.map((item, index) => (
            <li key={index}>{String(item)}</li>
          ))}
        </ul>
      );
    }

    // If content is an object with nested objects (like everspan, cirrata)
    else if (typeof content === "object" && content !== null) {
      console.log("Rendering object content:", content);
      return (
        <div className="space-y-6">
          {Object.entries(content as Record<string, unknown>).map(
            ([key, value]) => {
              // If the value is a nested object (like performanceMetrics)
              if (
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
              ) {
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(value as Record<string, unknown>).map(
                        ([nestedKey, nestedValue]) => {
                          // Check if nestedValue is also an object (deeper nesting)
                          if (
                            typeof nestedValue === "object" &&
                            nestedValue !== null &&
                            !Array.isArray(nestedValue)
                          ) {
                            return (
                              <div key={nestedKey} className="md:col-span-2">
                                <h4 className="text-md font-medium text-gray-800 mb-2 capitalize">
                                  {nestedKey.replace(/([A-Z])/g, " $1").trim()}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                                  {Object.entries(
                                    nestedValue as Record<string, unknown>
                                  ).map(([deepKey, deepValue]) => (
                                    <div
                                      key={deepKey}
                                      className="bg-gray-50 p-3 rounded-lg"
                                    >
                                      <p className="text-sm text-gray-500 capitalize">
                                        {deepKey
                                          .replace(/([A-Z])/g, " $1")
                                          .trim()}
                                      </p>
                                      <p className="font-medium text-gray-900">
                                        {String(deepValue)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          // Handle arrays within nested objects
                          else if (Array.isArray(nestedValue)) {
                            return (
                              <div key={nestedKey} className="md:col-span-2">
                                <p className="text-sm text-gray-500 capitalize mb-2">
                                  {nestedKey.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                                <ul className="list-disc pl-4 space-y-1">
                                  {nestedValue.map((item, idx) => (
                                    <li key={idx} className="text-gray-900">
                                      {String(item)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          // Regular key-value pairs
                          else {
                            return (
                              <div
                                key={nestedKey}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <p className="text-sm text-gray-500 capitalize">
                                  {nestedKey.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                                <p className="font-medium text-gray-900">
                                  {String(nestedValue)}
                                </p>
                              </div>
                            );
                          }
                        }
                      )}
                    </div>
                  </div>
                );
              }
              // Handle arrays at the top level
              else if (Array.isArray(value)) {
                return (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 capitalize mb-2">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {value.map((item, idx) => (
                        <li key={idx} className="text-gray-900">
                          {String(item)}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              // For regular key-value pairs at the top level
              else {
                return (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="font-medium text-gray-900">{String(value)}</p>
                  </div>
                );
              }
            }
          )}
        </div>
      );
    }

    // If content is a string, render as a paragraph
    else if (typeof content === "string") {
      return <p>{content}</p>;
    } else {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Upload
          </button>
          <div className="flex space-x-4">
            <Button
              label="Download PDF"
              secondary
              onClick={handleDownloadPDF}
              icon="external-link"
            />
            <Button
              label="Copy Summary"
              secondary
              onClick={handleCopyToClipboard}
              icon="external-link"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8" ref={summaryRef}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-indigo-100 rounded-lg p-2">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Document Summary
            </h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading summary...</p>
          ) : (
            <div>
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-indigo-800 capitalize">
                  Document Type: {summary.documentType}
                </h2>
              </div>

              <div className="space-y-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                    Overview
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-justify">
                    {summary.overview}
                  </div>
                </div>

                {Object.entries(summary.sections).map(
                  ([sectionKey, sectionContent]) => {
                    const title = sectionKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();
                    return (
                      <div key={sectionKey}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                          {title}
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-justify">
                          {renderSectionContent(sectionContent)}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-12">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  Ask a Follow-up Question
                </h2>
                
                {/* Initial input box (shown only when chat is not active) */}
                {!showChat ? (
                  <form onSubmit={handleAskQuestion} className="flex space-x-4">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about specific details in the document..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                    <Button
                      label={asking ? "Asking..." : "Ask"}
                      primary
                      icon="arrow-right"
                      onClick={() =>
                        handleAskQuestion(
                          new Event("submit") as unknown as React.FormEvent
                        )
                      }
                    />
                  </form>
                ) : null}
                
                {/* Chat Messages */}
                {showChat && (
                  <div className="mt-8 border rounded-lg overflow-hidden">
                    <div className="bg-indigo-50 p-3 border-b">
                      <h3 className="font-medium text-indigo-800">Conversation</h3>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.type === "user" ? "bg-indigo-100 text-indigo-900" : "bg-white border border-gray-200 shadow-sm"}`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {message.type === "user" ? (
                                <>
                                  <User className="h-4 w-4 text-indigo-600" />
                                  <span className="text-xs font-medium text-indigo-600">
                                    You
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Bot className="h-4 w-4 text-gray-600" />
                                  <span className="text-xs font-medium text-gray-600">
                                    AI Assistant
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="prose prose-sm max-w-none">
                              {message.type === "ai" ? (
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              ) : (
                                <p>{message.content}</p>
                              )}
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="border-t p-3 bg-white">
                      <form onSubmit={handleAskQuestion} className="flex space-x-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Continue the conversation..."
                          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        />
                        <button
                          type="submit"
                          disabled={asking}
                          className="bg-indigo-600 text-white rounded-md p-2 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                        >
                          {asking ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
