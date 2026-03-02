import { Request, Response } from 'express';
import prisma from '../config/database';
import { createArtworkSchema, updateArtworkSchema } from '../lib/validators/artwork';

export const createArtwork = async (req: Request, res: Response) => {
  const artistId = req.userId;
  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const validation = createArtworkSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  try {
    const artwork = await prisma.artwork.create({
      data: {
        ...validation.data,
        artistId,
      },
    });
    return res.status(201).json(artwork);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

export const getArtworks = async (_req: Request, res: Response) => { 
  try {
    const artworks = await prisma.artwork.findMany({
      include: { artist: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    return res.json(artworks);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

export const getArtworkById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: { artist: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    return res.json(artwork);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

export const updateArtwork = async (req: Request, res: Response) => {
  const { id } = req.params;
  const artistId = req.userId;
  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const validation = updateArtworkSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  try {
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
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

export const deleteArtwork = async (req: Request, res: Response) => {
  const { id } = req.params;
  const artistId = req.userId;
  if (!artistId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const artwork = await prisma.artwork.findUnique({ where: { id } });

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    if (artwork.artistId !== artistId) {
      return res.status(403).json({ message: 'Not authorized to delete this artwork' });
    }

    await prisma.artwork.delete({ where: { id } });
    return res.json({ message: 'Artwork removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};
