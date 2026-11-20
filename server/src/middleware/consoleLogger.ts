/**
 * Console Logger Middleware
 *
 * Request/response logging with configurable verbosity, color-coded status,
 * and an in-memory ring buffer for the admin diagnostic endpoint.
 */

import type { Request, Response, NextFunction } from 'express';

// ─── Log Levels ────────────────────────────────────────────────────────────────

type LogLevel = 'minimal' | 'standard' | 'verbose';

function getLogLevel(): LogLevel {
  const level = (process.env.CONSOLE_LOG_LEVEL || 'standard').toLowerCase();
  if (level === 'minimal' || level === 'standard' || level === 'verbose') return level;
  return 'standard';
}

// ─── Ring Buffer for Stats ─────────────────────────────────────────────────────

interface LogEntry {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  timestamp: Date;
  userEmail?: string;
  responseSize: number;
}

const RING_BUFFER_SIZE = 2000;
const logBuffer: LogEntry[] = [];

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > RING_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

/** Returns a snapshot of recent log entries for the stats endpoint. */
export function getLogBuffer(): LogEntry[] {
  return [...logBuffer];
}

// ─── Color Helpers ─────────────────────────────────────────────────────────────

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function statusColor(code: number): string {
  if (code >= 500) return RED;
  if (code >= 300) return YELLOW;
  return GREEN;
}

// ─── Sensitive Field Filtering ─────────────────────────────────────────────────

const SENSITIVE_FIELDS = ['password', 'authorization', 'token', 'secret', 'creditcard', 'card_number'];

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ─── Middleware ─────────────────────────────────────────────────────────────────

export function consoleLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const level = getLogLevel();

  // Capture user email if authenticated (set by protect middleware upstream)
  const authReq = req as Request & { user?: { email?: string } };

  // Hook into response finish to capture status/duration/size
  const originalEnd = res.end;
  res.end = function (...args: Parameters<typeof res.end>): ReturnType<typeof res.end> {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;
    const contentLength = Number(res.getHeader('content-length')) || 0;

    const entry: LogEntry = {
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      durationMs,
      timestamp: new Date(),
      userEmail: authReq.user?.email,
      responseSize: contentLength,
    };

    // Always add to ring buffer regardless of log level
    addToBuffer(entry);

    // Determine if we should log based on level
    let shouldLog = false;
    if (level === 'verbose') {
      shouldLog = true;
    } else if (level === 'standard') {
      // Log errors (5xx) and warnings (4xx)
      shouldLog = statusCode >= 400;
    } else {
      // minimal — errors only
      shouldLog = statusCode >= 500;
    }

    if (shouldLog) {
      const color = statusColor(statusCode);
      const timestamp = entry.timestamp.toISOString();
      const userPart = entry.userEmail ? ` ${CYAN}[${entry.userEmail}]${RESET}` : '';

      if (level === 'verbose') {
        console.log(
          `${GRAY}${timestamp}${RESET} ${color}${req.method}${RESET} ${req.originalUrl}${userPart} → ${color}${statusCode}${RESET} (${durationMs}ms, ${contentLength}B)`
        );
        // In verbose mode, also log sanitized body for non-GET requests
        if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
          console.log(`${GRAY}  Body:${RESET}`, JSON.stringify(sanitizeBody(req.body)));
        }
      } else {
        console.log(
          `${GRAY}${timestamp}${RESET} ${color}${req.method} ${req.originalUrl}${RESET} → ${color}${statusCode}${RESET} (${durationMs}ms)`
        );
      }
    }

    return originalEnd.apply(res, args);
  } as typeof res.end;

  next();
}
