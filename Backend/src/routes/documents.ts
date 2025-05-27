import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DocumentsController } from '../controllers/documentsController';

const router = Router();
const documentsController = DocumentsController.getInstance();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
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
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
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
  documentsController.analyzeDocument.bind(documentsController)
);

// Route to generate PDF from summary
router.post('/generate-pdf', documentsController.generatePDF.bind(documentsController));

export default router;
