import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided. Please provide a valid JWT token.' 
      });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token has expired. Please log in again.' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token. Please provide a valid JWT.' });
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};