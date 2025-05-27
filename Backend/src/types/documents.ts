import { Request } from 'express';

export interface MulterFile extends Express.Multer.File {}

export interface RequestWithFile extends Request {
  file?: MulterFile;
}
