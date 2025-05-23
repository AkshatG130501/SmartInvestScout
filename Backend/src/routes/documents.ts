import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { extractTextFromDocument } from '../utils/documentParser';
import { PerplexityService } from '../utils/perplexityService';
import PDFDocument from 'pdfkit';

// Define file interface for multer
interface MulterFile extends Express.Multer.File {}

// Define request interface with file
interface RequestWithFile extends Request {
  file?: MulterFile;
}

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: MulterFile,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: MulterFile,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req: Request, file: MulterFile, cb: multer.FileFilterCallback) => {
  // Accept only PDF, DOCX, and TXT files
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'text/plain'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Route to analyze document
router.post(
  '/analyze',
  upload.single('document'),
  async (req: RequestWithFile, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      logger.info(`Processing document: ${req.file.originalname}`);

      // Extract text from the uploaded document
      const text = await extractTextFromDocument(req.file.path, req.file.mimetype);

      // Get summary from Perplexity
      const perplexityService = PerplexityService.getInstance();
      const summary = await perplexityService.getDocumentSummary(text);

      // Clean up the uploaded file after processing
      fs.unlinkSync(req.file.path);

      return res.status(200).json(summary);
    } catch (error) {
      logger.error('Error analyzing document:', error);
      next(error);
    }
  }
);

// Route to generate PDF from summary
router.post('/generate-pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { summary } = req.body;
    if (!summary) {
      return res.status(400).json({ error: 'No summary provided' });
    }

    // Create a new PDF document with margins
    const doc = new PDFDocument({
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      size: 'A4',
      info: {
        Title: 'Document Summary',
        Author: 'SmartInvestScout',
        Subject: summary.documentType,
      },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document-summary.pdf');

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add header with logo placeholder
    doc.rect(0, 0, doc.page.width, 60).fill('#4F46E5'); // Indigo color
    doc.fontSize(24).fillColor('white').text('Document Summary', 50, 20, { align: 'center' });
    doc.moveDown(2);

    // Reset text color for content
    doc.fillColor('black');

    // Add document type with styling
    doc.fontSize(16).fillColor('#4F46E5').text('Document Type', { underline: true });
    doc.fontSize(14).fillColor('#374151').text(summary.documentType);
    doc.moveDown();

    // Add overview with styling
    doc.fontSize(16).fillColor('#4F46E5').text('Overview', { underline: true });
    doc.fontSize(14).fillColor('#374151').text(summary.overview, {
      align: 'justify',
      lineGap: 5,
    });
    doc.moveDown();

    // Add sections with styling
    doc.fontSize(16).fillColor('#4F46E5').text('Sections', { underline: true });
    doc.moveDown();

    if (summary.sections && typeof summary.sections === 'object') {
      Object.entries(summary.sections as Record<string, unknown>).forEach(
        ([sectionName, content]) => {
          // Add section header with background
          doc.rect(0, doc.y, doc.page.width - 100, 25).fill('#F3F4F6');
          doc
            .fontSize(14)
            .fillColor('#4F46E5')
            .text(sectionName, 50, doc.y + 5, { underline: true });
          doc.moveDown();

          if (typeof content === 'string') {
            doc.fontSize(12).fillColor('#374151').text(content, {
              align: 'justify',
              lineGap: 5,
            });
          } else if (Array.isArray(content)) {
            content.forEach((item) => {
              doc.fontSize(12).fillColor('#374151').text(`• ${item}`, {
                lineGap: 5,
              });
            });
          } else if (typeof content === 'object' && content !== null) {
            Object.entries(content as Record<string, unknown>).forEach(([key, value]) => {
              doc.fontSize(12).fillColor('#374151').text(`${key}: ${value}`, {
                lineGap: 5,
              });
            });
          }

          doc.moveDown();
        }
      );
    }

    // Add footer
    const footerText = 'Generated by SmartInvestScout';
    doc
      .fontSize(10)
      .fillColor('#6B7280')
      .text(footerText, 50, doc.page.height - 50, { align: 'center' });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    logger.error('Error generating PDF:', error);
    next(error);
  }
});

export const documentsRouter = router;
