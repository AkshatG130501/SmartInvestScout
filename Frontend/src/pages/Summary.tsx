import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import Button from "../components/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DocumentSummary } from "../lib/api";

// Default summary structure in case no data is available
const defaultSummary: DocumentSummary = {
  documentType: "Unknown Document",
  overview: "No document summary available. Please upload a document first.",
  sections: {},
};

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [summary, setSummary] = useState<DocumentSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  // Helper function to render different types of section content
  const renderSectionContent = (content: unknown) => {
    // If content is an array of objects (like keyMetrics)
    if (
      Array.isArray(content) &&
      content.length > 0 &&
      typeof content[0] === "object"
    ) {
      // Check if array items have common properties that suggest a table structure
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
              // If the value is a nested object
              if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(value as Record<string, unknown>).map(
                        ([nestedKey, nestedValue]) => (
                          <div key={nestedKey} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 capitalize">
                              {nestedKey.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="font-medium text-gray-900">{String(nestedValue)}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              }
              // For regular key-value pairs
              return (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="font-medium text-gray-900">{String(value)}</p>
                </div>
              );
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

  useEffect(() => {
    // Retrieve the document summary from session storage
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
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!summaryRef.current) return;

    try {
      const canvas = await html2canvas(summaryRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("document-summary.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setAsking(false);
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Upload</span>
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

        <div className="bg-white rounded-xl shadow-sm p-6" ref={summaryRef}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-indigo-100 rounded-lg p-2">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Document Summary
            </h1>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading document summary...</p>
            </div>
          ) : (
            <div>
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-indigo-800">
                  Document Type: {summary.documentType}
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="overview">
                  <AccordionTrigger>Overview</AccordionTrigger>
                  <AccordionContent>{summary.overview}</AccordionContent>
                </AccordionItem>

                {/* Dynamically render sections based on the document type */}
                {Object.entries(summary.sections).map(
                  ([sectionKey, sectionContent]) => {
                    // Format the section key for display
                    const formattedSectionKey = sectionKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();

                    return (
                      <AccordionItem key={sectionKey} value={sectionKey}>
                        <AccordionTrigger>
                          {formattedSectionKey}
                        </AccordionTrigger>
                        <AccordionContent>
                          {renderSectionContent(sectionContent)}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ask a Follow-up Question
            </h2>
            <form onSubmit={handleAskQuestion} className="flex space-x-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about specific details in the document..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
