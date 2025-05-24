import api from './client';
import { DocumentSummary } from './types';
import { formatErrorMessage } from './errors';

/**
 * Uploads and analyzes a document
 * @param file The file to analyze
 * @returns A summary of the document analysis
 */
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
    return response.data as DocumentSummary;
  } catch (error: unknown) {
    console.error("Error analyzing document:", formatErrorMessage(error));
    throw error;
  }
};
