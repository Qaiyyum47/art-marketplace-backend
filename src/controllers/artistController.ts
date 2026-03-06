import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { validateUUID } from '../utils/uuidValidator';
import { parsePaginationParams } from '../utils/paginationHelper';

export const getAllArtists = asyncHandler(async (req: Request, res: Response) => {
  // Add pagination to prevent expensive queries
  const { limit, offset } = req.query;
  const { limit: limitNum, offset: offsetNum } = parsePaginationParams(
    limit as string | undefined,
    offset as string | undefined
  );

  const [artists, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.ARTIST },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        profileImage: true,
        country: true,
        birthYear: true,
        genre: true,
        createdAt: true,
        _count: {
          select: {
            artworks: true,
            followedBy: true,
          },
        },
      },
      take: limitNum,
      skip: offsetNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: UserRole.ARTIST } }),
  ]);

  const formattedArtists = artists.map((artist) => ({
    id: artist.id,
    firstName: artist.firstName,
    lastName: artist.lastName,
    bio: artist.bio,
    profileImage: artist.profileImage,
    country: artist.country,
    birthYear: artist.birthYear,
    genre: artist.genre,
    createdAt: artist.createdAt,
    workCount: artist._count.artworks,
    followerCount: artist._count.followedBy,
  }));

  return res.json({
    data: formattedArtists,
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < total,
    },
  });
});

export const getArtistById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Artist ID');

  const artist = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      profileImage: true,
      country: true,
      birthYear: true,
      genre: true,
      createdAt: true,
      artworks: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true,
          category: true,
          isAvailable: true,
          isFeatured: true,
          views: true,
        },
        take: 50, // Limit artworks to prevent huge responses
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          artworks: true,
          followedBy: true, // Use Prisma count instead of separate query
        },
      },
    },
  });

  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }

  return res.json({
    id: artist.id,
    firstName: artist.firstName,
    lastName: artist.lastName,
    bio: artist.bio,
    profileImage: artist.profileImage,
    country: artist.country,
    birthYear: artist.birthYear,
    genre: artist.genre,
    createdAt: artist.createdAt,
    artworks: artist.artworks,
    workCount: artist._count.artworks,
    followerCount: artist._count.followedBy,
  });
});

export const toggleFollowArtist = asyncHandler(async (req: Request, res: Response) => {
  const { id: artistId } = req.params as { id: string };
  validateUUID(artistId, 'Artist ID');
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (userId === artistId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  // Check if artist exists and is an ARTIST account
  const artist = await prisma.user.findUnique({ where: { id: artistId } });
  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }

  if (artist.role !== UserRole.ARTIST) {
    return res.status(400).json({ message: 'You can only follow artist accounts' });
  }

  // Use transaction to prevent race condition
  // Atomically delete if exists, then create if it didn't
  const result = await prisma.$transaction(async (tx) => {
    const deleted = await tx.userFollow.deleteMany({
      where: {
        followerId: userId,
        followingId: artistId,
      },
    });

    if (deleted.count > 0) {
      return { isFollowing: false, message: 'Unfollowed artist' };
    } else {
      await tx.userFollow.create({
        data: {
          followerId: userId,
          followingId: artistId,
        },
      });
      return { isFollowing: true, message: 'Followed artist' };
    }
  });

  return res.json(result);
});

export const getArtistFollowers = asyncHandler(async (req: Request, res: Response) => {
  const { id: artistId } = req.params as { id: string };
  validateUUID(artistId, 'Artist ID');

  const followers = await prisma.userFollow.findMany({
    where: { followingId: artistId },
    select: {
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });

  return res.json(followers.map((f) => f.follower));
});

