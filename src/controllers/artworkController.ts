import { Request, Response } from 'express';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { createArtworkSchema, updateArtworkSchema } from '../lib/validators/artwork';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteFromCloudinary } from '../services/cloudinaryService';
import { parsePaginationParams, parseSortParam } from '../utils/paginationHelper';
import { validateUUID } from '../utils/uuidValidator';
import {
  ARTWORK_TYPE_SUGGESTIONS,
  MEDIUM_SUGGESTIONS,
  MATERIALS_SUGGESTIONS,
  CATEGORY_SUGGESTIONS,
  CONDITION_SUGGESTIONS,
  GENRE_SUGGESTIONS,
} from '../constants/artworkOptions';

export const createArtwork = asyncHandler(async (req: Request, res: Response) => {
  const artistId = req.userId;
  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const validation = createArtworkSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const artwork = await prisma.artwork.create({
    data: {
      ...validation.data,
      artistId,
    },
  });
  return res.status(201).json(artwork);
});

export const getArtworks = asyncHandler(async (req: Request, res: Response) => {
  const { category, artist, search, sort = 'newest', limit, offset } = req.query;

  const { limit: limitNum, offset: offsetNum } = parsePaginationParams(
    limit as string | undefined,
    offset as string | undefined
  );

  // Build filter
  const where: Prisma.ArtworkWhereInput = {};

  if (category) {
    where.category = { equals: category as string, mode: 'insensitive' };
  }

  if (artist) {
    where.artist = { OR: [{ firstName: { contains: artist as string, mode: 'insensitive' } }, { lastName: { contains: artist as string, mode: 'insensitive' } }] };
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { category: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const orderBy = parseSortParam(sort as string);

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      include: { artist: { select: { id: true, firstName: true, lastName: true, profileImage: true, country: true, genre: true, bio: true } } },
      orderBy,
      take: limitNum,
      skip: offsetNum,
    }),
    prisma.artwork.count({ where }),
  ]);

  return res.json({
    data: artworks,
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < total,
    },
  });
});

export const getArtworkById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Artwork ID');
  
  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { artist: { select: { id: true, firstName: true, lastName: true, profileImage: true, bio: true, country: true, genre: true } } },
  });

  if (!artwork?.artist) {
    return res.status(404).json({ message: 'Artwork or artist not found' });
  }

  return res.json(artwork);
});

export const getMyWorks = asyncHandler(async (req: Request, res: Response) => {
  const artistId = req.userId;
  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { sort = 'newest', limit, offset } = req.query;
  const { limit: limitNum, offset: offsetNum } = parsePaginationParams(
    limit as string | undefined,
    offset as string | undefined
  );

  const orderBy = parseSortParam(sort as string);

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where: { artistId },
      include: { artist: { select: { id: true, firstName: true, lastName: true, profileImage: true, country: true, genre: true, bio: true } } },
      orderBy,
      take: limitNum,
      skip: offsetNum,
    }),
    prisma.artwork.count({ where: { artistId } }),
  ]);

  return res.json({
    data: artworks,
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < total,
    },
  });
});

export const updateArtwork = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Artwork ID');
  const artistId = req.userId;

  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const validation = updateArtworkSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const artwork = await prisma.artwork.findUnique({ where: { id } });

  if (!artwork) {
    return res.status(404).json({ message: 'Artwork not found' });
  }

  if (artwork.artistId !== artistId) {
    return res.status(403).json({ message: 'Not authorized to update this artwork' });
  }

  const nextImagePublicId = validation.data.imagePublicId;
  const shouldDeleteOldCloudinaryImage =
    Boolean(nextImagePublicId) &&
    Boolean(artwork.imagePublicId) &&
    nextImagePublicId !== artwork.imagePublicId;

  if (shouldDeleteOldCloudinaryImage) {
    await deleteFromCloudinary(artwork.imagePublicId!);
  }

  const updatedArtwork = await prisma.artwork.update({
    where: { id },
    data: validation.data,
  });
  return res.json(updatedArtwork);
});

export const deleteArtwork = asyncHandler(async (req: Request, res: Response) => {
  const artistId = req.userId;
  const { id } = req.params as { id: string };

  // Check authorization BEFORE validating UUID
  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  validateUUID(id, 'Artwork ID');

  const artwork = await prisma.artwork.findUnique({ where: { id } });

  if (!artwork) {
    return res.status(404).json({ message: 'Artwork not found' });
  }

  if (artwork.artistId !== artistId) {
    return res.status(403).json({ message: 'Not authorized to delete this artwork' });
  }

  // Delete from database first, then clean up Cloudinary
  // This ensures artwork is removed even if Cloudinary deletion fails
  await prisma.artwork.delete({ where: { id } });

  // Clean up Cloudinary image if it exists
  if (artwork.imagePublicId) {
    try {
      await deleteFromCloudinary(artwork.imagePublicId);
    } catch (error) {
      // Log error but don't fail the response - artwork is already deleted from DB
      process.stderr.write(
        `Warning: Failed to delete Cloudinary image ${artwork.imagePublicId}: ${error instanceof Error ? error.message : 'unknown error'}\n`
      );
    }
  }

  return res.json({ message: 'Artwork removed' });
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id: artworkId } = req.params as { id: string };

  // Check authorization BEFORE validating UUID
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  validateUUID(artworkId, 'Artwork ID');

  // Use transaction to prevent race condition
  // Atomically delete if exists, then create if it didn't
  const result = await prisma.$transaction(async (tx) => {
    const deleted = await tx.favorite.deleteMany({
      where: {
        userId,
        artworkId,
      },
    });

    if (deleted.count > 0) {
      return { isFavorite: false, message: 'Artwork removed from favorites' };
    } else {
      await tx.favorite.create({
        data: {
          userId,
          artworkId,
        },
      });
      return { isFavorite: true, message: 'Artwork added to favorites' };
    }
  });

  return res.json(result);
});

export const getFavoriteArtworks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      artwork: {
        include: {
          artist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              bio: true,
              country: true,
              genre: true,
            },
          },
        },
      },
    },
  });

  const artworks = favorites.map((f) => f.artwork);
  return res.json(artworks);
});

export const getArtworkOptions = asyncHandler(async (_req: Request, res: Response) => {
  return res.json({
    artworkTypes: ARTWORK_TYPE_SUGGESTIONS,
    mediums: MEDIUM_SUGGESTIONS,
    materials: MATERIALS_SUGGESTIONS,
    categories: CATEGORY_SUGGESTIONS,
    conditions: CONDITION_SUGGESTIONS,
    genres: GENRE_SUGGESTIONS,
  });
});
