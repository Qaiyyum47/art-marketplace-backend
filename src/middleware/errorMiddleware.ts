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

  if (isDevelopment) {
    console.error(`[ERROR] ${req.method} ${req.path}`, err);
  } else {
    console.error(`[ERROR] ${statusCode}: ${message}`);
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
