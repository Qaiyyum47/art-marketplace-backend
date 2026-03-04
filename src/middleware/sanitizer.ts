import { Request, Response, NextFunction } from 'express';

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

const sanitizeString = (value: any): any => {
  return typeof value === 'string' ? value.trim() : value;
};

const sanitizeObjectInPlace = (obj: any): void => {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.has(key)) {
      delete obj[key];
      continue;
    }

    const value = obj[key];
    if (typeof value === 'string') {
      obj[key] = value.trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitizeObjectInPlace(value);
    } else if (Array.isArray(value)) {
      obj[key] = value.map(sanitizeString);
    }
  }
};

export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObjectInPlace(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    sanitizeObjectInPlace(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizeObjectInPlace(req.params);
  }

  next();
};
