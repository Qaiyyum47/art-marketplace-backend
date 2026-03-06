import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export const authorize = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User account is inactive or not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions for this action' });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};
