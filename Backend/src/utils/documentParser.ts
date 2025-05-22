import fs from 'fs';
import { promisify } from 'util';
import { logger } from './logger';
// Use require instead of import for modules without type definitions
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const readFileAsync = promisify(fs.readFile);

/**
 * Extract text from different document types
 * @param filePath Path to the uploaded file
 * @param mimeType MIME type of the file
 * @returns Extracted text from the document
 */
export async function extractTextFromDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractTextFromPdf(filePath);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractTextFromDocx(filePath);
      case 'text/plain':
        return await extractTextFromTxt(filePath);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    logger.error(`Error extracting text from document: ${error}`);
    throw error;
  }
}

/**
 * Extract text from PDF file
 * @param filePath Path to the PDF file
 * @returns Extracted text from the PDF
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = await readFileAsync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    logger.error(`Error extracting text from PDF: ${error}`);
    throw error;
  }
}

/**
 * Extract text from DOCX file
 * @param filePath Path to the DOCX file
 * @returns Extracted text from the DOCX
 */
async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    logger.error(`Error extracting text from DOCX: ${error}`);
    throw error;
  }
}

/**
 * Extract text from TXT file
 * @param filePath Path to the TXT file
 * @returns Extracted text from the TXT
 */
async function extractTextFromTxt(filePath: string): Promise<string> {
  try {
    const data = await readFileAsync(filePath, 'utf8');
    return data;
  } catch (error) {
    logger.error(`Error extracting text from TXT: ${error}`);
    throw error;
  }
}
