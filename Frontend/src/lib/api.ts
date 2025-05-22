import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface DocumentSummary {
  overview: string;
  keyThemes: string[];
  financialHighlights: Record<string, string>;
  risks: string[];
  tone: string;
  forwardLooking: string;
}

export const uploadAndAnalyzeDocument = async (
  file: File
): Promise<DocumentSummary> => {
  // Create form data to send the file
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await api.post("api/documents/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};

export default api;
