import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { extractTextFromDocument } from '../utils/documentParser';
import { PerplexityService } from '../utils/perplexityService';

// Define file interface for multer
interface MulterFile extends Express.Multer.File {}

// Define request interface with file
interface RequestWithFile extends Request {
  file?: MulterFile;
}

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
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
router.post('/analyze', upload.single('document'), async (req: RequestWithFile, res: Response, next: NextFunction) => {
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
});

export const documentsRouter = router;
