import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  type?: string;
  code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload.',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      message: 'Request payload too large. Maximum allowed size is 1MB.',
    });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'error',
        message: 'Uploaded file is too large. Maximum file size is 5MB.',
      });
    }

    return res.status(400).json({
      status: 'error',
      message: err.message || 'Upload error.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const isDevelopment = env.NODE_ENV === 'development';

  // Only log errors in development or log severe errors in production to stdout/stderr
  // In production, you should use a proper logging service (e.g., Winston, Pino)
  if (isDevelopment) {
    // Development: Log full error details to console
    process.stderr.write(`[ERROR] ${req.method} ${req.path} - ${statusCode}: ${message}\n`);
    if (err.stack) {
      process.stderr.write(`${err.stack}\n`);
    }
  } else if (statusCode >= 500) {
    // Production: Only log server errors (5xx) to stderr
    process.stderr.write(`[ERROR] ${statusCode}: ${message}\n`);
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.originalUrl}`,
  });
};
