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

export const getArtworks = asyncHandler(async (req: Request, res: Response) => {
  const { category, artist, search, sort = 'newest', limit = '12', offset = '0' } = req.query;

  const limitNum = Math.min(Number(limit) || 12, 100);
  const offsetNum = Number(offset) || 0;

  // Build filter
  const where: any = {};

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

  // Determine sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  } else if (sort === 'popular') {
    orderBy = { views: 'desc' };
  } else if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  }

  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      include: { artist: { select: { id: true, firstName: true, lastName: true, email: true, country: true, genre: true } } },
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
