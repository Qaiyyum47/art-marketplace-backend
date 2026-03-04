import { Request } from 'express';
import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const rateLimitGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === '/health' || isDev;
  },
  handler: (_req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

export const rateLimitAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return email || req.ip || 'unknown';
  },
  handler: (_req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many login/register attempts, please try again after 15 minutes.',
    });
  },
});

export const rateLimitUpload = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many upload attempts, please slow down and try again later.',
    });
  },
});
