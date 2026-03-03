import { Request, Response } from 'express';
import prisma from '../config/database';
import { createArtworkSchema, updateArtworkSchema } from '../lib/validators/artwork';
import { asyncHandler } from '../utils/asyncHandler';

export const createArtwork = asyncHandler(async (req: Request, res: Response) => {
  const artistId = (req as any).userId;
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

export const getArtworks = asyncHandler(async (_req: Request, res: Response) => {
  const artworks = await prisma.artwork.findMany({
    include: { artist: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  return res.json(artworks);
});

export const getArtworkById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { artist: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!artwork) {
    return res.status(404).json({ message: 'Artwork not found' });
  }
  return res.json(artwork);
});

export const updateArtwork = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const artistId = (req as any).userId;

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

  const updatedArtwork = await prisma.artwork.update({
    where: { id },
    data: validation.data,
  });
  return res.json(updatedArtwork);
});

export const deleteArtwork = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const artistId = (req as any).userId;

  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const artwork = await prisma.artwork.findUnique({ where: { id } });

  if (!artwork) {
    return res.status(404).json({ message: 'Artwork not found' });
  }

  if (artwork.artistId !== artistId) {
    return res.status(403).json({ message: 'Not authorized to delete this artwork' });
  }

  await prisma.artwork.delete({ where: { id } });
  return res.json({ message: 'Artwork removed' });
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { id: artworkId } = req.params as { id: string };
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_artworkId: {
        userId,
        artworkId,
      },
    },
  });

  if (favorite) {
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });
    return res.json({ message: 'Artwork removed from favorites', isFavorite: false });
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        artworkId,
      },
    });
    return res.json({ message: 'Artwork added to favorites', isFavorite: true });
  }
});

export const getFavoriteArtworks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

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
              email: true,
            },
          },
        },
      },
    },
  });

  const artworks = favorites.map((f) => f.artwork);
  return res.json(artworks);
});
