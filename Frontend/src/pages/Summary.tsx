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
  overview: "No document summary available. Please upload a document first.",
  keyThemes: ["No themes available"],
  financialHighlights: {
    revenue: "Not available",
    ebitda: "Not available",
    netProfit: "Not available",
    cashFlow: "Not available",
  },
  risks: ["No risks identified"],
  tone: "No tone analysis available",
  forwardLooking: "No forward-looking statements identified",
};

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [summary, setSummary] = useState<DocumentSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Retrieve the document summary from session storage
    const storedSummary = sessionStorage.getItem('documentSummary');
    if (storedSummary) {
      try {
        setSummary(JSON.parse(storedSummary));
      } catch (error) {
        console.error('Error parsing document summary:', error);
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
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="overview">
                <AccordionTrigger>Overview</AccordionTrigger>
                <AccordionContent>{summary.overview}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="key-themes">
                <AccordionTrigger>Key Themes</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-4 space-y-2">
                    {summary.keyThemes.map((theme, index) => (
                      <li key={index}>{theme}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="financial-highlights">
                <AccordionTrigger>Financial Highlights</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(summary.financialHighlights).map(
                      ([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="font-medium text-gray-900">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="risks">
                <AccordionTrigger>Risks</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-4 space-y-2">
                    {summary.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tone">
                <AccordionTrigger>Document Tone</AccordionTrigger>
                <AccordionContent>{summary.tone}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="forward-looking">
                <AccordionTrigger>Forward-looking Commentary</AccordionTrigger>
                <AccordionContent>{summary.forwardLooking}</AccordionContent>
              </AccordionItem>
            </Accordion>
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
