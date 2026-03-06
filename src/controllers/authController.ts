import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, registerSchema, updateProfileSchema } from '../lib/validators/auth';

// Security constant for bcrypt salt rounds
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Generate JWT token for authenticated user
 * Extracted to avoid duplication between register and login
 */
function createAuthToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
}

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const { email, password, firstName, lastName, role } = validation.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ 
      message: 'This email is already registered. Please log in or use a different email.' 
    });
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  const finalRole = role === UserRole.ADMIN ? UserRole.BUYER : (role || UserRole.BUYER);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: finalRole,
    },
  });

  const token = createAuthToken(user.id);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const { email, password } = validation.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = createAuthToken(user.id);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      bio: true,
      profileImage: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
});

export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const following = await prisma.userFollow.findMany({
    where: {
      followerId: userId,
      following: {
        role: UserRole.ARTIST,
      },
    },
    include: {
      following: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          bio: true,
          genre: true,
          country: true,
        },
      },
    },
  });

  const artists = following.map((f) => f.following);
  return res.json(artists);
});
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: validation.data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      bio: true,
      profileImage: true,
      updatedAt: true,
    },
  });

  return res.json(user);
});

