import type { NextFunction, Request, Response } from 'express';

export interface HttpError extends Error {
  statusCode?: number;
}

interface MongooseValidationError {
  name: string;
  errors?: Record<string, { message: string; path?: string }>;
  message: string;
}

interface MongooseCastError {
  name: string;
  kind?: string;
  value?: unknown;
  path?: string;
  message: string;
}

interface MongoServerError {
  code?: number;
  keyValue?: Record<string, unknown>;
  message: string;
}

function isMongooseValidationError(err: unknown): err is MongooseValidationError {
  return (err as MongooseValidationError).name === 'ValidationError';
}

function isMongooseCastError(err: unknown): err is MongooseCastError {
  return (err as MongooseCastError).name === 'CastError';
}

function isMongoServerError(err: unknown): err is MongoServerError {
  return (err as MongoServerError).code === 11000;
}

export function errorHandler(
  err: HttpError | MongooseValidationError | MongooseCastError | MongoServerError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Mongoose validation error — map field-level messages
  if (isMongooseValidationError(err)) {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path || 'unknown',
      message: e.message,
    }));

    console.error(`[ERROR] 400 — Validation failed: ${err.message}`);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Mongoose CastError — invalid ObjectId or type mismatch
  if (isMongooseCastError(err)) {
    console.error(`[ERROR] 400 — Invalid ${err.kind || 'value'} for field "${err.path}": ${String(err.value)}`);
    res.status(400).json({
      success: false,
      message: `Invalid ${err.kind || 'value'} for field "${err.path}"`,
    });
    return;
  }

  // MongoDB duplicate key error
  if (isMongoServerError(err)) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    console.error(`[ERROR] 400 — Duplicate key: ${fields}`);
    res.status(400).json({
      success: false,
      message: `Duplicate value for field(s): ${fields}`,
    });
    return;
  }

  // Generic / thrown errors
  const statusCode = (err as HttpError).statusCode && (err as HttpError).statusCode! >= 400
    ? (err as HttpError).statusCode!
    : 500;

  const isProduction = process.env.NODE_ENV === 'production';
  const message = statusCode === 500 && isProduction
    ? 'Internal server error'
    : err.message || 'Internal server error';

  console.error(`[ERROR] ${statusCode} — ${err.message}`);

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  // Include stack trace in non-production environments for debugging
  if (!isProduction && 'stack' in err && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
