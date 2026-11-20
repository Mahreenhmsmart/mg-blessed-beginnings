import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationError } from 'express-validator';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract the first error message for a user-friendly response
    const firstError = errors.array()[0] as ValidationError;
    const errorMessage = firstError?.msg || 'Validation failed';

    // Return consistent error shape matching controller responses
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
    return;
  }
  next();
}
