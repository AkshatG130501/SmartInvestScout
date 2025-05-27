import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Send,
  Bot,
  User,
  Loader2
} from "lucide-react";
import Button from "../components/Button";
import { getPersonalizedChatResponse } from "../lib/api/chat";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

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

interface DocumentSummary {
  documentType: string;
  dynamicSummary: string;
}

const defaultSummary: DocumentSummary = {
  documentType: "Unknown Document",
  dynamicSummary:
    "No document summary available. Please upload a document first.",
};

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [summary, setSummary] = useState<DocumentSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

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
        const parsedSummary = JSON.parse(storedSummary);
        setSummary({
          documentType: parsedSummary.documentType,
          dynamicSummary: parsedSummary.dynamicSummary,
        });
      } catch (error) {
        console.error("Error parsing document summary:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary.dynamicSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post<Blob>(
        "/api/documents/generate-pdf",
        { summary },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "document-summary.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const documentContext = `Document Type: ${summary.documentType}\n\nOverview: ${summary.dynamicSummary}`;
      const enhancedQuery = `Context about the document:\n${documentContext}\n\nUser question: ${question.trim()}`;
      const response = await getPersonalizedChatResponse(
        user?.id || "anonymous",
        enhancedQuery
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        personalizationContext: response.personalizationContext,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAsking(false);
      setQuestion("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-6 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
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
              label={copied ? "Copied!" : "Copy Summary"}
              secondary
              onClick={handleCopyToClipboard}
              icon={copied ? "check" : "external-link"}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-2 transition-colors duration-300">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Document Summary
            </h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading summary...</p>
          ) : (
            <div>
              <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg transition-colors duration-300">
                <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 capitalize transition-colors duration-300">
                  Document Type: {summary.documentType}
                </h2>
              </div>

              <div className="prose prose-indigo dark:prose-invert max-w-none transition-colors duration-300">
                <ReactMarkdown>{summary.dynamicSummary}</ReactMarkdown>
              </div>

              <div className="mt-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize transition-colors duration-300">
                  Ask a Follow-up Question
                </h2>

                {!showChat ? (
                  <form onSubmit={handleAskQuestion} className="flex space-x-4">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about specific details in the document..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-colors duration-300"
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

                {showChat && (
                  <div className="mt-8 border rounded-lg overflow-hidden">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 border-b border-indigo-100 dark:border-indigo-900 transition-colors duration-300">
                      <h3 className="font-medium text-indigo-800 dark:text-indigo-300 transition-colors duration-300">
                        Conversation
                      </h3>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === "user"
                                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {message.type === "user" ? (
                                <>
                                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
                                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                                    You
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                    AI Assistant
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none transition-colors duration-300">
                              {message.type === "ai" ? (
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              ) : (
                                <p>{message.content}</p>
                              )}
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 transition-colors duration-300">
                      <form
                        onSubmit={handleAskQuestion}
                        className="flex space-x-2"
                      >
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Continue the conversation..."
                          className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-colors duration-300"
                        />
                        <button
                          type="submit"
                          disabled={asking}
                          className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-md p-2 hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-900/50"
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
