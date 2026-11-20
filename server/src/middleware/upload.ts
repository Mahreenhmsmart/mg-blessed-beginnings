/**
 * Upload Middleware — Multer configuration for file uploads.
 */

import multer, { type FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';
import type { Request } from 'express';
import { UPLOADS_DIR } from '../paths';

// Allowed MIME types for images
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Configure disk storage with unique filenames
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter to validate MIME types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: jpg, png, webp, gif`));
  }
};

// Create the multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Export constants for use in routes
export { MAX_FILE_SIZE, ALLOWED_MIMETYPES };
